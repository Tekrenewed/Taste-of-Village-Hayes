import React from 'react';
import { SHOP_CONFIG } from '../shopConfig';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  schema?: string;
  imageUrl?: string; // e.g. /assets/menu_og_image.png
}

export const SEOHead: React.FC<SEOHeadProps> = ({ 
  title, 
  description, 
  canonicalUrl,
  schema,
  imageUrl = `${SHOP_CONFIG.website}/assets/og-default.png` // Default fallback image
}) => {
  const fullTitle = `${title} | ${SHOP_CONFIG.name}`;
  
  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {canonicalUrl && <link rel="canonical" href={`${SHOP_CONFIG.website}${canonicalUrl}`} />}
      
      {/* Facebook / Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      {canonicalUrl && <meta property="og:url" content={`${SHOP_CONFIG.website}${canonicalUrl}`} />}
      
      {/* Twitter / X */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      
      {schema && (
        <script type="application/ld+json">
          {schema}
        </script>
      )}
    </Helmet>
  );
};
