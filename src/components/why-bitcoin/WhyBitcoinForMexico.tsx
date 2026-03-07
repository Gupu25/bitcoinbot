'use client';

import { motion } from 'framer-motion';
import { Send, TrendingDown, Users, Shield } from 'lucide-react';

interface WhyBitcoinForMexicoProps {
  lang?: 'en' | 'es';
}

const benefits = {
  en: [
    {
      icon: Send,
      title: 'Cheaper remittances',
      desc: 'Send money to family abroad for a fraction of what banks charge. Mexico is the world\'s top recipient of remittances—Bitcoin and Lightning can cut fees dramatically.',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      icon: TrendingDown,
      title: 'Protection from inflation',
      desc: 'The peso loses value over time. Bitcoin has a fixed supply of 21 million—no government can print more. Many use it as a long-term store of value.',
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
    {
      icon: Users,
      title: 'Financial inclusion',
      desc: 'Millions of Mexicans lack bank accounts or have poor credit. With Bitcoin, you can save, send, and receive money without a bank—no credit check required.',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      icon: Shield,
      title: 'You control your money',
      desc: 'Banks can freeze accounts or limit withdrawals. With Bitcoin, your keys = your money. No one can block you from using what\'s yours.',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
  ],
  es: [
    {
      icon: Send,
      title: 'Remesas más baratas',
      desc: 'Envía dinero a tu familia en el extranjero por una fracción de lo que cobran los bancos. México es el mayor receptor de remesas del mundo—Bitcoin y Lightning pueden reducir las comisiones drásticamente.',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      icon: TrendingDown,
      title: 'Protección contra la inflación',
      desc: 'El peso pierde valor con el tiempo. Bitcoin tiene un suministro fijo de 21 millones—ningún gobierno puede imprimir más. Muchos lo usan como reserva de valor a largo plazo.',
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
    {
      icon: Users,
      title: 'Inclusión financiera',
      desc: 'Millones de mexicanos no tienen cuenta bancaria o tienen mal historial crediticio. Con Bitcoin puedes ahorrar, enviar y recibir dinero sin banco—sin consulta de buró.',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      icon: Shield,
      title: 'Tú controlas tu dinero',
      desc: 'Los bancos pueden congelar cuentas o limitar retiros. Con Bitcoin, tus llaves = tu dinero. Nadie puede bloquearte de usar lo que es tuyo.',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
  ],
};

export function WhyBitcoinForMexico({ lang = 'es' }: WhyBitcoinForMexicoProps) {
  const t = benefits[lang];
  const header = lang === 'es'
    ? { title: '¿Por qué Bitcoin para México?', subtitle: 'Cuatro razones por las que Bitcoin importa para los mexicanos' }
    : { title: 'Why Bitcoin for Mexico?', subtitle: 'Four reasons why Bitcoin matters for Mexicans' };

  return (
    <section id="why-bitcoin" className="scroll-mt-20 py-12 sm:py-16 lg:py-20 bg-slate-950 border-t border-slate-800/70">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-14"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white font-mono mb-2">
            {header.title}
          </h2>
          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto">
            {header.subtitle}
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
          {t.map((benefit, i) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`p-6 sm:p-8 rounded-2xl border border-slate-800 ${benefit.bgColor} hover:border-slate-700 transition-colors`}
            >
              <div className={`inline-flex p-3 rounded-xl ${benefit.bgColor} mb-4`}>
                <benefit.icon className={`w-6 h-6 sm:w-7 sm:h-7 ${benefit.color}`} />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                {benefit.title}
              </h3>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                {benefit.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
