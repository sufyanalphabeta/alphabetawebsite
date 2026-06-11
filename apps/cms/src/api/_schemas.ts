// Importing schema JSON files causes TypeScript to copy them to dist/
// This is required for Strapi v5 to find content-type schemas at runtime.
import _client from './client/content-types/client/schema.json';
import _companyProfile from './company-profile/content-types/company-profile/schema.json';
import _contactSubmission from './contact-submission/content-types/contact-submission/schema.json';
import _industry from './industry/content-types/industry/schema.json';
import _navigationFooter from './navigation-footer/content-types/navigation-footer/schema.json';
import _navigationHeader from './navigation-header/content-types/navigation-header/schema.json';
import _newsletterSubscriber from './newsletter-subscriber/content-types/newsletter-subscriber/schema.json';
import _office from './office/content-types/office/schema.json';
import _page from './page/content-types/page/schema.json';
import _partner from './partner/content-types/partner/schema.json';
import _partnerType from './partner-type/content-types/partner-type/schema.json';
import _productCategory from './product-category/content-types/product-category/schema.json';
import _productFaq from './product-faq/content-types/product-faq/schema.json';
import _productFeature from './product-feature/content-types/product-feature/schema.json';
import _productModule from './product-module/content-types/product-module/schema.json';
import _seoDefault from './seo-default/content-types/seo-default/schema.json';
import _service from './service/content-types/service/schema.json';
import _siteSetting from './site-setting/content-types/site-setting/schema.json';
import _softwareProduct from './software-product/content-types/software-product/schema.json';
import _successMetric from './success-metric/content-types/success-metric/schema.json';
import _successStory from './success-story/content-types/success-story/schema.json';
import _testimonial from './testimonial/content-types/testimonial/schema.json';

export {
  _client,
  _companyProfile,
  _contactSubmission,
  _industry,
  _navigationFooter,
  _navigationHeader,
  _newsletterSubscriber,
  _office,
  _page,
  _partner,
  _partnerType,
  _productCategory,
  _productFaq,
  _productFeature,
  _productModule,
  _seoDefault,
  _service,
  _siteSetting,
  _softwareProduct,
  _successMetric,
  _successStory,
  _testimonial,
};
