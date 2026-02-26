'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Database, Zap, Globe, Layers, Droplet, Bitcoin, Sparkles, ChevronDown, Info } from 'lucide-react';
import { useState, useCallback } from 'react';

interface ProtocolLayersProps {
  lang?: 'en' | 'es';
}

interface LayerFeature {
  name: string;
  nameEs: string;
  tooltip: string;
  tooltipEs: string;
}

interface Layer {
  id: string;
  name: string;
  nameEs: string;
  shortName: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  description: string;
  descriptionEs: string;
  analogy: string;
  analogyEs: string;
  features: LayerFeature[];
  stats: { label: string; labelEs: string; value: string }[];
}

const layers: Layer[] = [
  {
    id: 'l1',
    name: 'Base Layer (L1)',
    nameEs: 'Capa Base (L1)',
    shortName: 'L1',
    icon: Database,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    textColor: 'text-orange-500',
    borderColor: 'border-orange-500/20',
    description: 'Settlement & finality. The foundation where all transactions are permanently recorded.',
    descriptionEs: 'Liquidación y finalidad. La base donde todas las transacciones se registran permanentemente.',
    analogy: '🏛️ Like a bank vault: secure, slow, and permanent.',
    analogyEs: '🏛️ Como una caja fuerte: segura, lenta y permanente.',
    features: [
      { name: 'Proof-of-Work', nameEs: 'Prueba de Trabajo', tooltip: 'Miners secure the network with computational power', tooltipEs: 'Mineros aseguran la red con poder computacional' },
      { name: '21M cap', nameEs: 'Tope 21M', tooltip: 'Digital scarcity - only 21 million Bitcoin will ever exist', tooltipEs: 'Escasez digital - solo existirán 21 millones de Bitcoin' },
      { name: 'Decentralized', nameEs: 'Descentralizado', tooltip: 'No single entity controls the network', tooltipEs: 'Ninguna entidad controla la red' }
    ],
    stats: [
      { label: 'Block time', labelEs: 'Bloque', value: '~10 min' },
      { label: 'Finality', labelEs: 'Finalidad', value: '60 min' },
      { label: 'Capacity', labelEs: 'Capacidad', value: '~7 tps' }
    ]
  },
  {
    id: 'l2-lightning',
    name: 'Lightning Network',
    nameEs: 'Lightning Network',
    shortName: 'Lightning',
    icon: Zap,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    textColor: 'text-blue-500',
    borderColor: 'border-blue-500/20',
    description: 'Instant payments at scale. A layer ON TOP of Bitcoin for fast, cheap transactions.',
    descriptionEs: 'Pagos instantáneos a escala. Una capa SOBRE Bitcoin para transacciones rápidas y baratas.',
    analogy: '⚡ Like a tab at a bar: open, transact, settle once.',
    analogyEs: '⚡ Como una cuenta en un bar: abres, transaccionas, pagas al cerrar.',
    features: [
      { name: 'Payment Channels', nameEs: 'Canales de Pago', tooltip: 'Private pathways for unlimited off-chain transactions', tooltipEs: 'Caminos privados para transacciones ilimitadas off-chain' },
      { name: 'Atomic Swaps', nameEs: 'Swaps Atómicos', tooltip: 'Trustless exchange between cryptocurrencies', tooltipEs: 'Intercambio sin confianza entre criptomonedas' },
      { name: 'Micro-payments', nameEs: 'Micro-pagos', tooltip: 'Send amounts as small as 1 satoshi', tooltipEs: 'Envía montos tan pequeños como 1 satoshi' }
    ],
    stats: [
      { label: 'Speed', labelEs: 'Velocidad', value: 'Instant' },
      { label: 'Fee', labelEs: 'Comisión', value: '< $0.001' },
      { label: 'Capacity', labelEs: 'Capacidad', value: '1M+ tps' }
    ]
  },
  {
    id: 'l2-liquid',
    name: 'Liquid Network',
    nameEs: 'Liquid Network',
    shortName: 'Liquid',
    icon: Droplet,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-400/10',
    textColor: 'text-cyan-400',
    borderColor: 'border-cyan-400/20',
    description: 'Bitcoin sidechain for traders & institutions. Confidential transactions with 1-minute blocks.',
    descriptionEs: 'Sidechain de Bitcoin para traders e instituciones. Transacciones confidenciales con bloques de 1 minuto.',
    analogy: '💧 Like a private express lane: faster, confidential, federated.',
    analogyEs: '💧 Como un carril exprés privado: más rápido, confidencial, federado.',
    features: [
      { name: '1-min blocks', nameEs: 'Bloques 1-min', tooltip: 'Blocks confirmed every minute, not 10', tooltipEs: 'Bloques confirmados cada minuto, no 10' },
      { name: 'Confidential', nameEs: 'Confidencial', tooltip: 'Transaction amounts are hidden by default', tooltipEs: 'Montos de transacción ocultos por defecto' },
      { name: 'L-BTC pegged', nameEs: 'L-BTC respaldado', tooltip: '1:1 backed by real Bitcoin in federation custody', tooltipEs: '1:1 respaldado por Bitcoin real en custodia federada' }
    ],
    stats: [
      { label: 'Block time', labelEs: 'Bloque', value: '1 min' },
      { label: 'Finality', labelEs: 'Finalidad', value: '2 min' },
      { label: 'Privacy', labelEs: 'Privacidad', value: 'Default' }
    ]
  },
  {
    id: 'l3',
    name: 'Application Layer',
    nameEs: 'Capa de Aplicación',
    shortName: 'L3',
    icon: Globe,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    textColor: 'text-purple-500',
    borderColor: 'border-purple-500/20',
    description: 'Applications built on top. Wallets, services, and protocols that make Bitcoin useful.',
    descriptionEs: 'Aplicaciones construidas encima. Wallets, servicios y protocolos que hacen útil a Bitcoin.',
    analogy: '📱 Like apps on your phone: L1 is the phone, L2 the data, L3 the apps.',
    analogyEs: '📱 Como apps en tu teléfono: L1 el teléfono, L2 los datos, L3 las apps.',
    features: [
      { name: 'Non-custodial', nameEs: 'No-custodial', tooltip: 'You control your private keys', tooltipEs: 'Tú controlas tus llaves privadas' },
      { name: 'DLCs', nameEs: 'DLCs', tooltip: 'Discreet Log Contracts - private smart contracts', tooltipEs: 'Contratos de Log Discreto - smart contracts privados' },
      { name: 'RGB/Assets', nameEs: 'RGB/Activos', tooltip: 'Tokens issued on Bitcoin using RGB protocol', tooltipEs: 'Tokens emitidos en Bitcoin usando protocolo RGB' }
    ],
    stats: [
      { label: 'Wallets', labelEs: 'Wallets', value: '100+' },
      { label: 'Protocols', labelEs: 'Protocolos', value: '30+' },
      { label: 'Apps', labelEs: 'Apps', value: '500+' }
    ]
  },
];

export function ProtocolLayers({ lang = 'en' }: ProtocolLayersProps) {
  const [expandedLayer, setExpandedLayer] = useState<string | null>(null);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // 🐱 FIX #1: Cerrar tooltip al cambiar de layer
  const handleExpand = useCallback((layerId: string) => {
    setExpandedLayer(prev => prev === layerId ? null : layerId);
    setActiveTooltip(null);
  }, []);

  const t = {
    en: {
      title: 'Bitcoin Layers',
      subtitle: 'A stack of technologies working together.',
      tip: 'Lightning and Liquid are layers ON TOP of Bitcoin — they extend, never replace it.',
      expand: 'Click to expand',
      l1Note: 'The foundation. All transactions eventually settle here.',
      lightningNote: 'Built ON TOP of Bitcoin. Not a separate token!',
      liquidNote: 'Federated sidechain. Faster and private, but requires trust in federation.',
      l3Note: 'Applications that make Bitcoin usable day-to-day.',
      footer: '⚡ Lightning extends Bitcoin — Liquid complements it — Both settle to L1 ⚡'
    },
    es: {
      title: 'Capas de Bitcoin',
      subtitle: 'Un stack de tecnologías trabajando juntas.',
      tip: 'Lightning y Liquid son capas SOBRE Bitcoin — extienden, nunca reemplazan.',
      expand: 'Clic para expandir',
      l1Note: 'La base. Todas las transacciones eventualmente se liquidan aquí.',
      lightningNote: 'Construida SOBRE Bitcoin. ¡No es un token separado!',
      liquidNote: 'Sidechain federada. Más rápida y privada, pero requiere confianza en la federación.',
      l3Note: 'Aplicaciones que hacen útil a Bitcoin en el día a día.',
      footer: '⚡ Lightning extiende Bitcoin — Liquid lo complementa — Ambos liquidan a L1 ⚡'
    }
  }[lang];

  const getNote = (layerId: string) => {
    const notes: Record<string, string> = {
      'l1': t.l1Note,
      'l2-lightning': t.lightningNote,
      'l2-liquid': t.liquidNote,
      'l3': t.l3Note
    };
    return notes[layerId] || '';
  };

  const getFeatureName = (feature: LayerFeature) => lang === 'es' ? feature.nameEs : feature.name;
  const getFeatureTooltip = (feature: LayerFeature) => lang === 'es' ? feature.tooltipEs : feature.tooltip;
  const getStatLabel = (stat: Layer['stats'][0]) => lang === 'es' ? stat.labelEs : stat.label;

  return (
    // 🐱 FIX #2: ID para navegación por anchor
    <section id="protocol" className="w-full bg-slate-950 py-12 sm:py-16 lg:py-20 scroll-mt-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-12"
        >
          <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 bg-slate-900 rounded-2xl border border-slate-700 mb-4 sm:mb-6">
            <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-[#f7931a]" />
            <span className="text-sm sm:text-lg font-mono tracking-wider text-slate-200">{t.title}</span>
          </div>
          <p className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            {t.subtitle}
          </p>
        </motion.div>

        {/* Tip box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mb-6 sm:mb-8 p-4 sm:p-6 bg-blue-950/30 border border-blue-500/20 rounded-2xl flex items-start gap-3"
        >
          <Sparkles className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm sm:text-base text-blue-200 leading-relaxed">{t.tip}</p>
        </motion.div>

        {/* 🐱 FIX #3: Label L2 horizontal en vez de vertical rotado */}
        <div className="mb-4 sm:mb-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-700 to-slate-700" />
          <span className="text-xs sm:text-sm font-mono text-slate-500 uppercase tracking-widest whitespace-nowrap">
            Layer 2 Solutions
          </span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent via-slate-700 to-slate-700" />
        </div>

        {/* Layers container */}
        <div className="bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-800 p-4 sm:p-6 lg:p-8">
          {/* Layers stack */}
          <div className="space-y-4 sm:space-y-6">
            {layers.map((layer, index) => {
              const Icon = layer.icon;
              const isExpanded = expandedLayer === layer.id;
              const isL2 = layer.id === 'l2-lightning' || layer.id === 'l2-liquid';

              return (
                <motion.div
                  key={layer.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  {/* Connector line */}
                  {index < layers.length - 1 && (
                    <div className="absolute left-5 sm:left-6 top-full w-px h-4 sm:h-6 bg-gradient-to-b from-[#f7931a]/40 to-transparent" />
                  )}

                  {/* Layer card */}
                  <div
                    onClick={() => handleExpand(layer.id)}
                    className={`
                      group relative p-4 sm:p-5 rounded-xl sm:rounded-2xl border-2 transition-all cursor-pointer
                      ${layer.bgColor} ${layer.borderColor}
                      ${isL2 ? 'ring-1 sm:ring-2 ring-blue-500/20' : ''}
                      hover:border-opacity-60 active:scale-[0.99]
                    `}
                    role="button"
                    aria-expanded={isExpanded}
                  >
                    {/* L2 Badge */}
                    {isL2 && (
                      <div className={`
                        absolute -top-2 right-3 sm:-top-3 sm:right-4 
                        px-2 sm:px-3 py-0.5 sm:py-1 
                        text-white text-[10px] sm:text-xs font-mono rounded-full shadow-lg
                        flex items-center gap-1
                        ${layer.id === 'l2-lightning'
                          ? 'bg-gradient-to-r from-blue-600 to-[#f7931a]'
                          : 'bg-gradient-to-r from-cyan-500 to-blue-600'}
                      `}>
                        <Bitcoin className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        <span>L2</span>
                      </div>
                    )}

                    {/* Main content */}
                    <div className="flex gap-3 sm:gap-4">
                      {/* Icon */}
                      <div className={`
                        flex-shrink-0 p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-slate-900 border-2 h-fit
                        ${isL2 ? layer.borderColor.replace('20', '40') : 'border-slate-700'}
                      `}>
                        <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${layer.color}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Header */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <h3 className={`text-base sm:text-xl lg:text-2xl font-bold font-mono ${layer.color}`}>
                            {lang === 'es' ? layer.nameEs : layer.name}
                          </h3>
                          <div className="flex items-center gap-1 text-slate-500">
                            <span className="text-[10px] sm:text-xs opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline">
                              {t.expand}
                            </span>
                            <ChevronDown
                              className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            />
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-2">
                          {lang === 'es' ? layer.descriptionEs : layer.description}
                        </p>

                        {/* Analogy - más visible */}
                        <p className="text-sm text-slate-500 italic mb-3 sm:mb-4">
                          {lang === 'es' ? layer.analogyEs : layer.analogy}
                        </p>

                        {/* Features pills */}
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                          {layer.features.map((feature) => (
                            <button
                              key={feature.name}
                              onClick={(e) => {
                                e.stopPropagation();
                                const key = `${layer.id}-${feature.name}`;
                                setActiveTooltip(activeTooltip === key ? null : key);
                              }}
                              className={`
                                text-[10px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border font-mono transition-all
                                ${activeTooltip === `${layer.id}-${feature.name}`
                                  ? 'bg-orange-500 border-orange-500 text-black'
                                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                                }
                              `}
                            >
                              {getFeatureName(feature)}
                            </button>
                          ))}
                        </div>

                        {/* Tooltip */}
                        <AnimatePresence>
                          {activeTooltip?.startsWith(layer.id) && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-3 p-2.5 sm:p-3 bg-slate-800 rounded-lg text-xs text-slate-300"
                            >
                              {getFeatureTooltip(layer.features.find(f =>
                                activeTooltip === `${layer.id}-${f.name}`
                              )!)}
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Expanded content */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="pt-4 mt-4 border-t border-slate-700/50">
                                {/* Stats - 3 cols en móvil también pero más compacto */}
                                <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
                                  {layer.stats.map((stat) => (
                                    <div key={stat.label} className="text-center p-2 sm:p-3 bg-slate-900/60 rounded-lg sm:rounded-xl border border-slate-700">
                                      <div className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-500 mb-0.5 truncate">
                                        {getStatLabel(stat)}
                                      </div>
                                      <div className={`text-base sm:text-xl lg:text-2xl font-mono font-semibold ${layer.textColor}`}>
                                        {stat.value}
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                {/* Features detail - lista compacta */}
                                <div className="space-y-1.5 sm:space-y-2 mb-4">
                                  {layer.features.map((feature) => (
                                    <div key={feature.name} className="flex gap-2 text-xs sm:text-sm">
                                      <span className={layer.textColor}>→</span>
                                      <div className="min-w-0">
                                        <span className="font-mono text-slate-300">{getFeatureName(feature)}:</span>
                                        <span className="text-slate-500 ml-1 sm:ml-2">{getFeatureTooltip(feature)}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                {/* Note */}
                                <div className="p-2.5 sm:p-3 bg-slate-900/50 border-l-3 sm:border-l-4 border-[#f7931a] rounded-r-lg sm:rounded-r-xl">
                                  <p className="text-xs sm:text-sm text-slate-400 flex items-start gap-2">
                                    <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5 text-[#f7931a]" />
                                    {getNote(layer.id)}
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Footer legend */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-8 sm:mt-10 pt-5 sm:pt-6 border-t border-slate-800"
          >
            <div className="flex flex-wrap justify-center gap-3 sm:gap-6 lg:gap-8 text-xs sm:text-sm text-slate-500 font-mono">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-500" />
                <span>L1</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span>Lightning</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400" />
                <span>Liquid</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500" />
                <span>L3</span>
              </div>
            </div>

            <p className="text-center mt-4 sm:mt-6 text-xs text-slate-600 font-mono px-2">
              {t.footer}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}