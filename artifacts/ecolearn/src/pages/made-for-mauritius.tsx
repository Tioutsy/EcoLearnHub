import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Recycle,
  Scale,
  MapPin,
  Trash2,
  Building2,
  Quote,
  Leaf,
} from "lucide-react";

const wasteStreams = [
  {
    color: "bg-green-600",
    label: "Green",
    title: "Garden and organic waste",
    detail:
      "Leaves, grass cuttings, and food scraps that can be composted instead of sent to Mare Chicose landfill.",
  },
  {
    color: "bg-blue-600",
    label: "Blue",
    title: "Paper and cardboard",
    detail:
      "Office paper, newspapers, and packaging collected by local recyclers such as Mission Verte drop-off points.",
  },
  {
    color: "bg-amber-500",
    label: "Yellow",
    title: "Plastics and cans",
    detail:
      "PET bottles, containers, and aluminium cans that feed into the island's growing plastic recovery chain.",
  },
  {
    color: "bg-slate-700",
    label: "Black",
    title: "General waste",
    detail:
      "Non-recyclable residual waste. The goal of every module is to shrink this stream as far as possible.",
  },
];

const recyclingPartners = [
  {
    name: "Mission Verte",
    detail:
      "Network of voluntary recycling drop-off points across the island for paper, plastic, glass, and e-waste.",
  },
  {
    name: "We Recycle / BEM Recycling",
    detail:
      "Local operators that collect, sort, and bale recyclables for processing and export.",
  },
  {
    name: "Mare Chicose landfill",
    detail:
      "The single national landfill in the south east. Understanding its limits is why waste reduction matters here.",
  },
  {
    name: "Composting at Roches Noires",
    detail:
      "Organic waste platforms that turn green waste into compost instead of burying it.",
  },
];

const regulations = [
  {
    title: "Plastic bag and single-use plastic bans",
    detail:
      "Mauritius banned non-biodegradable plastic bags in 2016 and extended bans to single-use plastics in 2021. Teams learn what is allowed and what is not.",
  },
  {
    title: "Environment Protection Act",
    detail:
      "The legal backbone for EIA licences, effluent standards, and polluter responsibilities that local businesses must meet.",
  },
  {
    title: "Extended Producer Responsibility",
    detail:
      "Producers and importers carry responsibility for the waste their products create, including PET bottle schemes.",
  },
  {
    title: "Maurice Ile Durable vision",
    detail:
      "The national sustainable development direction that frames renewable energy, water, and waste targets for the island.",
  },
];

const caseStudies = [
  {
    sector: "Hospitality",
    company: "Coastal resort groups",
    story:
      "Beachfront resorts have cut single-use plastics in rooms and restaurants, introduced refill stations, and trained housekeeping teams on separation at source.",
  },
  {
    sector: "Agriculture",
    company: "Sugar cane estates",
    story:
      "Bagasse from sugar cane is burned to generate a meaningful share of the island's electricity, a Mauritian circular-economy story decades in the making.",
  },
  {
    sector: "Retail and FMCG",
    company: "Supermarket chains",
    story:
      "Local retailers replaced plastic bags with reusable alternatives and added in-store collection points for bottles and batteries.",
  },
];

const successStories = [
  {
    quote:
      "Our housekeeping and kitchen teams finally sort waste the same way every shift. Guests notice, and our landfill costs dropped.",
    role: "Sustainability lead, hospitality group",
  },
  {
    quote:
      "Training that talks about Mare Chicose and Mission Verte, not some generic city abroad, is what made it click for our staff.",
    role: "HR manager, retail company",
  },
];

export default function MadeForMauritius() {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-secondary text-white py-20 md:py-28">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        <div className="container relative mx-auto px-4">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm font-medium mb-6">
              <MapPin className="h-4 w-4" />
              Made for Mauritius
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif leading-[1.1] mb-6">
              Sustainability training built for the island, not imported from
              abroad.
            </h1>
            <p className="text-lg md:text-xl text-white/80 leading-relaxed mb-8">
              Generic courses talk about systems your teams will never use. Every
              EcoLearn module is grounded in the Mauritian waste system, local
              recyclers, our regulations, and real stories from companies on the
              island.
            </p>
            <Button
              size="lg"
              asChild
              className="bg-white text-secondary hover:bg-white/90 h-12 px-8 text-base"
            >
              <Link href="/courses">
                Explore the courses <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Waste sorting system */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mb-12">
            <div className="inline-flex items-center gap-2 text-primary font-medium text-sm mb-3">
              <Trash2 className="h-4 w-4" />
              The Mauritian waste sorting system
            </div>
            <h2 className="text-3xl font-bold font-serif mb-4">
              Separation at source, the way it works here
            </h2>
            <p className="text-muted-foreground text-lg">
              We teach the streams your teams actually handle, so good habits
              survive past the classroom and reduce what reaches Mare Chicose.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {wasteStreams.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-card border rounded-2xl p-6 shadow-sm"
              >
                <div
                  className={`h-10 w-10 rounded-lg ${s.color} mb-4 flex items-center justify-center text-white`}
                >
                  <Recycle className="h-5 w-5" />
                </div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  {s.label} stream
                </p>
                <h3 className="font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {s.detail}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Recycling ecosystem */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mb-12">
            <div className="inline-flex items-center gap-2 text-primary font-medium text-sm mb-3">
              <Recycle className="h-4 w-4" />
              The local recycling ecosystem
            </div>
            <h2 className="text-3xl font-bold font-serif mb-4">
              Who actually moves the materials
            </h2>
            <p className="text-muted-foreground text-lg">
              Your staff learn where recyclables really go on the island and the
              organisations that make recovery possible.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {recyclingPartners.map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-card border rounded-2xl p-6 shadow-sm flex gap-4"
              >
                <div className="h-10 w-10 shrink-0 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Leaf className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{p.name}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {p.detail}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Local regulations */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mb-12">
            <div className="inline-flex items-center gap-2 text-primary font-medium text-sm mb-3">
              <Scale className="h-4 w-4" />
              Local regulations
            </div>
            <h2 className="text-3xl font-bold font-serif mb-4">
              Compliance grounded in Mauritian law
            </h2>
            <p className="text-muted-foreground text-lg">
              Training that references the rules your business is actually held
              to, so compliance is practical, not theoretical.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {regulations.map((r, i) => (
              <motion.div
                key={r.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="border rounded-2xl p-6 bg-card shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <Scale className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-2">{r.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {r.detail}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Local case studies */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mb-12">
            <div className="inline-flex items-center gap-2 text-primary font-medium text-sm mb-3">
              <Building2 className="h-4 w-4" />
              Local case studies
            </div>
            <h2 className="text-3xl font-bold font-serif mb-4">
              Lessons from Mauritian industries
            </h2>
            <p className="text-muted-foreground text-lg">
              Real sectors, real constraints. Our content draws on how the
              island's own industries are tackling sustainability.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {caseStudies.map((c, i) => (
              <motion.div
                key={c.sector}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-card border rounded-2xl p-6 shadow-sm flex flex-col"
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">
                  {c.sector}
                </p>
                <h3 className="font-semibold mb-3">{c.company}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {c.story}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Success stories */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mb-12">
            <div className="inline-flex items-center gap-2 text-primary font-medium text-sm mb-3">
              <Quote className="h-4 w-4" />
              Mauritian success stories
            </div>
            <h2 className="text-3xl font-bold font-serif mb-4">
              What local teams tell us
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {successStories.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="border rounded-2xl p-8 bg-card shadow-sm"
              >
                <Quote className="h-8 w-8 text-primary/30 mb-4" />
                <p className="text-lg font-serif leading-relaxed mb-4">
                  {s.quote}
                </p>
                <p className="text-sm font-medium text-muted-foreground">
                  {s.role}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary/5 border-t">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-3xl font-bold font-serif mb-4">
            This is the difference between training and a tick box
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Give your teams sustainability training that belongs to Mauritius and
            actually changes how they work.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="h-12 px-8 text-base">
              <Link href="/pricing">View corporate plans</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="h-12 px-8 text-base"
            >
              <Link href="/courses">Browse courses</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
