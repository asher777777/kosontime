import { getKoswebTerminology, getKoswebSectionTheme, getKoswebSectionContainerProps } from '../../services/koswebSectionThemeBridge';
import React from 'react';
import { GeoLocalSectionConfig } from '../../types/sectionConfigs';
import { MapPin, Phone, Mail, Clock, MessageCircle, Navigation, Sparkles } from 'lucide-react';
import { useHostCapabilities } from '../../../../core/bridge/HostCapabilitiesContext';
import { BrandDnaContract } from '../../../../core/contracts';
import { resolveLiveBrandDna } from '../../generators/pageGenerator';
import { clsx } from 'clsx';

export const GeoLocalSection: React.FC<{ config: GeoLocalSectionConfig }> = ({ config }) => {
  const { getCapability } = useHostCapabilities();
  const rawBrandDna = getCapability<BrandDnaContract>('brand-dna')?.getBrandDna() || null;
  const brandDna = resolveLiveBrandDna(rawBrandDna);

  const isDummyPhone = (p?: string) => !p || p === '03-1234567' || p === '050-0000000' || p === '052-6968008' || p === '0501234567';
  const isDummyEmail = (e?: string) => !e || e === 'contact@example.com' || e === 'info@example.com' || e === 'ovt5771@gmail.com';
  const isDummyAddress = (a?: string) => !a || a === 'תל אביב, ישראל' || a === 'רחוב הרצל 1, תל אביב' || a === 'דרך מנחם בגין 144, תל אביב';

  const resolvedPhone = (!isDummyPhone(config?.phone) ? config.phone : null) || (!isDummyPhone(brandDna?.trust?.contactPhone) ? brandDna?.trust?.contactPhone : null) || '';
  const resolvedEmail = (!isDummyEmail(config?.email) ? config.email : null) || (!isDummyEmail(brandDna?.trust?.contactEmail) ? brandDna?.trust?.contactEmail : null) || '';
  const resolvedAddress = (!isDummyAddress(config?.address) ? config.address : null) || (!isDummyAddress(brandDna?.trust?.officeAddress) ? brandDna?.trust?.officeAddress : null) || '';
  const resolvedWhatsapp = (config?.whatsapp && !isDummyPhone(config.whatsapp) ? config.whatsapp : null) || (!isDummyPhone(brandDna?.trust?.whatsappSupportNumber) ? brandDna?.trust?.whatsappSupportNumber : null) || '';
  const resolvedCity = config?.city && config.city !== 'תל אביב' ? config.city : (brandDna?.trust?.city || '');
  const resolvedBusinessName = config?.businessName || brandDna?.identity?.companyName || '';

  // 🛡️ אין פולבק: אם אין נתוני מיקום/כתובת שמגיעים מקולקציית העמוד עבור האזור, או שהוגדר כלא גלוי - האזור לא מופיע כלל!
  const hasPageData = Boolean(
    (config?.title && config.title.trim().length > 0) ||
    resolvedAddress ||
    resolvedCity
  );

  if (config?.visible === false || !hasPageData) {
    return null;
  }

  const {
    anchorId = 'location',
    title = config?.title || getKoswebTerminology('sec_geo_title', 'הסניף והפעילות המקומית שלנו'),
    subtitle = config?.subtitle || '',
    serviceAreas = config?.serviceAreas || [],
    openingHours = config?.openingHours || [],
    backgroundColor = 'transparent',
  } = config;

  const mapSearchQuery = [resolvedAddress, resolvedCity].filter(Boolean).join(', ');
  const mapEmbedUrl = config?.mapEmbedUrl || (mapSearchQuery ? `https://maps.google.com/maps?q=${encodeURIComponent(mapSearchQuery)}&t=&z=14&ie=UTF8&iwloc=&output=embed` : '');

  return (
    <section
      id={anchorId || 'location'}
      className="w-full py-16 md:py-24 px-4 sm:px-6 lg:px-8 relative"
      style={{ backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined }}
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto flex flex-col gap-12">
        <div className="text-center max-w-2xl mx-auto flex flex-col items-center gap-3">
          {subtitle && subtitle.trim().length > 0 && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
              <MapPin className="w-3.5 h-3.5" />
              <span>{subtitle}</span>
            </div>
          )}
          {title && (
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {title}
            </h2>
          )}
        </div>

        <div className={clsx('grid gap-8 items-stretch', mapEmbedUrl ? 'grid-cols-1 lg:grid-cols-12' : 'max-w-2xl mx-auto w-full')}>
          {/* Info Card Column */}
          <div className={clsx('bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between backdrop-blur-xl shadow-2xl text-right', mapEmbedUrl ? 'lg:col-span-5' : 'w-full')}>
            <div className="flex flex-col gap-6">
              <div>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 block mb-1">
                  {getKoswebTerminology('sec_geolocal_branch_lbl', 'סניף מקומי')}
                </span>
                {resolvedBusinessName && (
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">{resolvedBusinessName}</h3>
                )}
                {resolvedAddress && (
                  <p className="text-sm text-slate-600 dark:text-slate-300 flex items-center gap-2 mt-1">
                    <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>{resolvedAddress}</span>
                  </p>
                )}
              </div>

              {/* Service Areas Pills */}
              {serviceAreas && serviceAreas.length > 0 && (
                <div>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-2">
                    {getKoswebTerminology('sec_geolocal_service_areas_lbl', 'אזורי שירות מורשים:')}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {serviceAreas.map((area, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Opening Hours */}
              {openingHours && openingHours.length > 0 && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-2">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>{getKoswebTerminology('sec_geolocal_hours_lbl', 'שעות פעילות וקבלת קהל:')}</span>
                  </span>
                  <div className="flex flex-col gap-1 text-xs text-slate-600 dark:text-slate-400">
                    {openingHours.map((hours, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span>{hours}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            {(resolvedWhatsapp || resolvedPhone) && (
              <div className="flex flex-wrap gap-3 pt-6 mt-6 border-t border-slate-200 dark:border-slate-800">
                {resolvedWhatsapp && (
                  <a
                    href={`https://wa.me/${resolvedWhatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 min-w-[130px] py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{getKoswebTerminology('sec_geolocal_wa_btn', 'שיחה בוואטסאפ')}</span>
                  </a>
                )}
                {resolvedPhone && (
                  <a
                    href={`tel:${resolvedPhone.replace(/[^0-9]/g, '')}`}
                    className="flex-1 min-w-[130px] py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all border border-slate-200 dark:border-slate-700"
                  >
                    <Phone className="w-4 h-4" />
                    <span>{getKoswebTerminology('sec_geolocal_call_btn', 'חיוג לסניף')}</span>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Interactive Map Column */}
          {mapEmbedUrl && (
            <div className="lg:col-span-7 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl min-h-[380px] relative bg-slate-100 dark:bg-slate-950">
              <iframe
                src={mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: '380px' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Google Maps"
                className="w-full h-full dark:filter dark:invert-[0.88] dark:hue-rotate-180 dark:contrast-125"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
