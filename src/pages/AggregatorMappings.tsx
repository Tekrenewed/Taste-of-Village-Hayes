import { useEffect, useState } from 'react';
import { Plus, Trash2, Search, AlertCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Mapping {
    id: string;
    tenant_id: string;
    platform: string;
    external_item_id: string;
    internal_product_id: string;
    created_at: string;
}

export default function AggregatorMappings() {
    const [mappings, setMappings] = useState<Mapping[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [platform, setPlatform] = useState('UBEREATS');
    const [tenantId, setTenantId] = useState('tenant-123'); // Default to generic for now
    
    // New mapping form state
    const [newExternalId, setNewExternalId] = useState('');
    const [newInternalId, setNewInternalId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const API_URL = import.meta.env.VITE_SVC_MENU_URL || 'http://localhost:8082';
    const API_KEY = import.meta.env.VITE_SVC_MENU_API_KEY || '';

    const fetchMappings = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_URL}/api/menu/mappings?tenant_id=${tenantId}&platform=${platform}`, {
                headers: {
                    'x-api-key': API_KEY,
                }
            });
            
            if (!res.ok) {
                throw new Error(`Failed to fetch mappings: ${res.statusText}`);
            }
            
            const data = await res.json();
            setMappings(data);
        } catch (err: any) {
            console.error('Failed to load mappings:', err);
            setError(err.message || 'Failed to load mappings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMappings();
    }, [platform, tenantId]);

    const handleCreateMapping = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newExternalId || !newInternalId) return;

        setIsSubmitting(true);
        setError(null);
        
        try {
            const res = await fetch(`${API_URL}/api/menu/mappings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': API_KEY,
                },
                body: JSON.stringify({
                    tenant_id: tenantId,
                    platform: platform,
                    external_item_id: newExternalId,
                    internal_product_id: newInternalId,
                })
            });

            if (!res.ok) {
                throw new Error('Failed to create mapping');
            }

            // Clear form
            setNewExternalId('');
            setNewInternalId('');
            
            // Refresh list
            fetchMappings();
        } catch (err: any) {
            setError(err.message || 'Failed to create mapping');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteMapping = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this mapping?")) return;
        
        try {
            const res = await fetch(`${API_URL}/api/menu/mappings?id=${id}`, {
                method: 'DELETE',
                headers: {
                    'x-api-key': API_KEY,
                }
            });

            if (!res.ok) {
                throw new Error('Failed to delete mapping');
            }

            // Update local state instead of full refresh for snappier UI
            setMappings(mappings.filter(m => m.id !== id));
        } catch (err: any) {
            alert(err.message || 'Failed to delete mapping');
        }
    };

    return (
        <div className="min-h-screen bg-brand-obsidian text-white p-8">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link to="/admin" className="p-2 rounded-full hover:bg-white/10 transition-colors">
                        <ArrowLeft size={24} className="text-white/80" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-display font-bold">Aggregator Mappings</h1>
                        <p className="text-white/60 mt-2">
                            Link Uber Eats / Deliveroo item IDs to internal POS products
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl flex items-center gap-3 text-red-400 mb-6">
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                )}

                <div className="flex gap-4 mb-6">
                    <div className="flex items-center gap-3 bg-black/20 p-3 px-4 rounded-xl border border-white/10 flex-1">
                        <Search size={20} className="text-white/50" />
                        <select 
                            value={platform}
                            onChange={(e) => setPlatform(e.target.value)}
                            className="bg-transparent border-none text-white outline-none w-full cursor-pointer font-medium"
                        >
                            <option value="UBEREATS" className="bg-brand-obsidian text-white">Uber Eats</option>
                            <option value="DELIVEROO" className="bg-brand-obsidian text-white">Deliveroo</option>
                            <option value="JUSTEAT" className="bg-brand-obsidian text-white">Just Eat</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-3 bg-black/20 p-3 px-4 rounded-xl border border-white/10 flex-1">
                        <span className="text-white/50 font-medium">Tenant</span>
                        <input
                            type="text"
                            value={tenantId}
                            onChange={(e) => setTenantId(e.target.value)}
                            className="bg-transparent border-none text-white outline-none w-full font-medium"
                        />
                    </div>
                </div>

                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 mb-6">
                    <h3 className="text-lg font-bold mb-4">Create New Mapping</h3>
                    <form onSubmit={handleCreateMapping} className="flex gap-4 items-end">
                        <div className="flex-1">
                            <label className="block text-white/60 mb-2 text-sm font-medium">
                                External Item ID (from {platform})
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. 1f4b23c..."
                                className="bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-pink transition-all w-full"
                                value={newExternalId}
                                onChange={(e) => setNewExternalId(e.target.value)}
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-white/60 mb-2 text-sm font-medium">
                                Internal Product ID (Your POS System)
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. menu-item-45"
                                className="bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-pink transition-all w-full"
                                value={newInternalId}
                                onChange={(e) => setNewInternalId(e.target.value)}
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="h-[50px] px-6 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center gap-2 transition-all disabled:opacity-70"
                        >
                            <Plus size={18} />
                            <span>{isSubmitting ? 'Saving...' : 'Add Mapping'}</span>
                        </button>
                    </form>
                </div>

                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                    <h3 className="text-lg font-bold mb-4">Active Mappings</h3>
                    
                    {loading ? (
                        <div className="p-8 text-center text-white/50 font-medium">
                            Loading mappings...
                        </div>
                    ) : mappings.length === 0 ? (
                        <div className="p-8 text-center text-white/50 font-medium">
                            No mappings found for this platform and tenant.
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {mappings.map(mapping => (
                                <div key={mapping.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                                    <div className="flex flex-1 gap-8">
                                        <div>
                                            <div className="text-white/50 text-xs font-medium mb-1">External ID</div>
                                            <div className="font-mono font-medium">{mapping.external_item_id}</div>
                                        </div>
                                        <div>
                                            <div className="text-white/50 text-xs font-medium mb-1">Internal POS ID</div>
                                            <div className="font-mono font-medium text-blue-400">{mapping.internal_product_id}</div>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleDeleteMapping(mapping.id)}
                                        className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                        title="Delete Mapping"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
