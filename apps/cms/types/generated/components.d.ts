import type { Schema, Struct } from '@strapi/strapi';

export interface SectionsContactFormBlock extends Struct.ComponentSchema {
  collectionName: 'components_sections_contact_form_blocks';
  info: {
    displayName: 'Contact Form Block';
  };
  attributes: {
    heading_ar: Schema.Attribute.String;
    heading_en: Schema.Attribute.String;
    show_map: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
  };
}

export interface SectionsCtaBlock extends Struct.ComponentSchema {
  collectionName: 'components_sections_cta_blocks';
  info: {
    displayName: 'CTA Block';
  };
  attributes: {
    background: Schema.Attribute.Enumeration<['light', 'dark', 'accent']> &
      Schema.Attribute.DefaultTo<'accent'>;
    button_label_ar: Schema.Attribute.String;
    button_label_en: Schema.Attribute.String;
    button_url: Schema.Attribute.String;
    heading_ar: Schema.Attribute.String;
    heading_en: Schema.Attribute.String;
    secondary_label_ar: Schema.Attribute.String;
    secondary_label_en: Schema.Attribute.String;
    secondary_url: Schema.Attribute.String;
    subheading_ar: Schema.Attribute.Text;
    subheading_en: Schema.Attribute.Text;
  };
}

export interface SectionsFeaturesGrid extends Struct.ComponentSchema {
  collectionName: 'components_sections_features_grids';
  info: {
    displayName: 'Features Grid';
  };
  attributes: {
    features: Schema.Attribute.Component<'shared.feature-item', true> &
      Schema.Attribute.SetMinMax<
        {
          max: 12;
        },
        number
      >;
    heading_ar: Schema.Attribute.String;
    heading_en: Schema.Attribute.String;
  };
}

export interface SectionsPartnersLogos extends Struct.ComponentSchema {
  collectionName: 'components_sections_partners_logos';
  info: {
    displayName: 'Partners Logos';
  };
  attributes: {
    heading_ar: Schema.Attribute.String;
    heading_en: Schema.Attribute.String;
    logos: Schema.Attribute.Media<'images', true>;
  };
}

export interface SectionsStatsBlock extends Struct.ComponentSchema {
  collectionName: 'components_sections_stats_blocks';
  info: {
    displayName: 'Stats Block';
  };
  attributes: {
    heading_ar: Schema.Attribute.String;
    heading_en: Schema.Attribute.String;
    stats: Schema.Attribute.Component<'shared.stat-item', true> &
      Schema.Attribute.SetMinMax<
        {
          max: 6;
        },
        number
      >;
  };
}

export interface SectionsTestimonialsBlock extends Struct.ComponentSchema {
  collectionName: 'components_sections_testimonials_blocks';
  info: {
    displayName: 'Testimonials Block';
  };
  attributes: {
    heading_ar: Schema.Attribute.String;
    heading_en: Schema.Attribute.String;
    items: Schema.Attribute.Component<'shared.testimonial-item', true> &
      Schema.Attribute.SetMinMax<
        {
          max: 6;
        },
        number
      >;
  };
}

export interface SectionsTextBlock extends Struct.ComponentSchema {
  collectionName: 'components_sections_text_blocks';
  info: {
    displayName: 'Text Block';
  };
  attributes: {
    align: Schema.Attribute.Enumeration<['start', 'center', 'end']> &
      Schema.Attribute.DefaultTo<'start'>;
    body_ar: Schema.Attribute.RichText;
    body_en: Schema.Attribute.RichText;
    heading_ar: Schema.Attribute.String;
    heading_en: Schema.Attribute.String;
  };
}

export interface SharedFeatureItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_feature_items';
  info: {
    displayName: 'Feature Item';
  };
  attributes: {
    body_ar: Schema.Attribute.Text;
    body_en: Schema.Attribute.Text;
    icon: Schema.Attribute.String;
    image: Schema.Attribute.Media<'images'>;
    title_ar: Schema.Attribute.String;
    title_en: Schema.Attribute.String;
  };
}

export interface SharedFooterColumn extends Struct.ComponentSchema {
  collectionName: 'components_shared_footer_columns';
  info: {
    displayName: 'Footer Column';
    icon: 'layout';
  };
  attributes: {
    links: Schema.Attribute.Component<'shared.simple-link', true>;
    title_ar: Schema.Attribute.String;
    title_en: Schema.Attribute.String;
  };
}

export interface SharedHeroBlock extends Struct.ComponentSchema {
  collectionName: 'components_shared_hero_blocks';
  info: {
    displayName: 'Hero Block';
    icon: 'star';
  };
  attributes: {
    cta_primary_label_ar: Schema.Attribute.String;
    cta_primary_label_en: Schema.Attribute.String;
    cta_primary_url: Schema.Attribute.String;
    cta_secondary_label_ar: Schema.Attribute.String;
    cta_secondary_label_en: Schema.Attribute.String;
    cta_secondary_url: Schema.Attribute.String;
    heading_ar: Schema.Attribute.String;
    heading_en: Schema.Attribute.String;
    image: Schema.Attribute.Media<'images'>;
    subheading_ar: Schema.Attribute.Text;
    subheading_en: Schema.Attribute.Text;
    video_url: Schema.Attribute.String;
  };
}

export interface SharedNavItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_nav_items';
  info: {
    displayName: 'Nav Item';
    icon: 'link';
  };
  attributes: {
    children: Schema.Attribute.Component<'shared.simple-link', true> &
      Schema.Attribute.SetMinMax<
        {
          max: 12;
        },
        number
      >;
    icon: Schema.Attribute.String;
    is_cta: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    label_ar: Schema.Attribute.String;
    label_en: Schema.Attribute.String;
    open_new_tab: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    url: Schema.Attribute.String;
  };
}

export interface SharedSeoMeta extends Struct.ComponentSchema {
  collectionName: 'components_shared_seo_metas';
  info: {
    displayName: 'SEO Meta';
    icon: 'search';
  };
  attributes: {
    canonical_url: Schema.Attribute.String;
    meta_description_ar: Schema.Attribute.Text;
    meta_description_en: Schema.Attribute.Text;
    meta_title_ar: Schema.Attribute.String;
    meta_title_en: Schema.Attribute.String;
    no_index: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    og_image: Schema.Attribute.Media<'images'>;
    og_title_ar: Schema.Attribute.String;
    og_title_en: Schema.Attribute.String;
  };
}

export interface SharedSimpleLink extends Struct.ComponentSchema {
  collectionName: 'components_shared_simple_links';
  info: {
    displayName: 'Simple Link';
    icon: 'link';
  };
  attributes: {
    label_ar: Schema.Attribute.String;
    label_en: Schema.Attribute.String;
    open_new_tab: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    url: Schema.Attribute.String;
  };
}

export interface SharedSocialLink extends Struct.ComponentSchema {
  collectionName: 'components_shared_social_links';
  info: {
    displayName: 'Social Link';
    icon: 'share';
  };
  attributes: {
    label: Schema.Attribute.String;
    platform: Schema.Attribute.Enumeration<
      [
        'facebook',
        'twitter',
        'linkedin',
        'instagram',
        'youtube',
        'whatsapp',
        'telegram',
        'tiktok',
      ]
    >;
    url: Schema.Attribute.String;
  };
}

export interface SharedStatItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_stat_items';
  info: {
    displayName: 'Stat Item';
  };
  attributes: {
    icon: Schema.Attribute.String;
    label_ar: Schema.Attribute.String;
    label_en: Schema.Attribute.String;
    value: Schema.Attribute.String;
  };
}

export interface SharedTestimonialItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_testimonial_items';
  info: {
    displayName: 'Testimonial Item';
  };
  attributes: {
    author_company: Schema.Attribute.String;
    author_name: Schema.Attribute.String;
    author_photo: Schema.Attribute.Media<'images'>;
    author_title: Schema.Attribute.String;
    quote_ar: Schema.Attribute.Text;
    quote_en: Schema.Attribute.Text;
    rating: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 5;
          min: 1;
        },
        number
      >;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'sections.contact-form-block': SectionsContactFormBlock;
      'sections.cta-block': SectionsCtaBlock;
      'sections.features-grid': SectionsFeaturesGrid;
      'sections.partners-logos': SectionsPartnersLogos;
      'sections.stats-block': SectionsStatsBlock;
      'sections.testimonials-block': SectionsTestimonialsBlock;
      'sections.text-block': SectionsTextBlock;
      'shared.feature-item': SharedFeatureItem;
      'shared.footer-column': SharedFooterColumn;
      'shared.hero-block': SharedHeroBlock;
      'shared.nav-item': SharedNavItem;
      'shared.seo-meta': SharedSeoMeta;
      'shared.simple-link': SharedSimpleLink;
      'shared.social-link': SharedSocialLink;
      'shared.stat-item': SharedStatItem;
      'shared.testimonial-item': SharedTestimonialItem;
    }
  }
}
