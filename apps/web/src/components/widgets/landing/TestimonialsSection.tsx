import { CheckCircle2, MessageSquare, Quote, Star } from "lucide-react";

const TESTIMONIALS = [
  {
    id: "t-1",
    author: "Sarah Jenkins",
    location: "London, United Kingdom",
    avatar: "SJ",
    avatarBg: "bg-blue-600 text-white",
    route: "Malé ⇄ Maafushi Island",
    rating: 5,
    date: "Travelled Aug 2026",
    comment:
      "Island hopping used to feel like guesswork with local jetty timetables. IslandHop made booking our speedboat to Maafushi effortless. We got our QR codes instantly and boarded with zero waiting!"
  },
  {
    id: "t-2",
    author: "Hassan Niyaz",
    location: "Malé Resident",
    avatar: "HN",
    avatarBg: "bg-emerald-600 text-white",
    route: "Malé ⇄ Thulusdhoo Commuter",
    rating: 5,
    date: "Weekly Commuter",
    comment:
      "I commute for surf coaching and business weekly. Having live vessel tracking and instant Apple Wallet passes is a game changer. The schedules are always 100% accurate."
  },
  {
    id: "t-3",
    author: "Matteo & Elena Rossi",
    location: "Milan, Italy",
    avatar: "MR",
    avatarBg: "bg-indigo-600 text-white",
    route: "Malé ⇄ Dhiffushi Island",
    rating: 5,
    date: "Travelled Jul 2026",
    comment:
      "We were travelling with scuba gear and large luggage. Adding baggage and choosing our preferred deck seats ahead of time gave us complete peace of mind. Highly recommended!"
  }
];

export function TestimonialsSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3.5 py-1 text-xs font-bold tracking-wider text-blue-600 uppercase shadow-xs dark:text-blue-400">
            <MessageSquare className="h-3.5 w-3.5" />
            <span>REAL TRAVELER EXPERIENCES</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Loved by 50,000+ Island Explorers
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Read authentic experiences from holidaymakers, surf enthusiasts, and island locals across the atolls.
          </p>
        </div>

        {/* Testimonials Cards Grid */}
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border/80 bg-card/90 p-6 sm:p-7 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 hover:border-blue-500/50 hover:shadow-xl"
            >
              <div className="space-y-4">
                {/* Rating Stars & Route Tag */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="rounded-full border border-border/60 bg-muted/60 px-2.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                    {t.date}
                  </span>
                </div>

                {/* Review Text */}
                <p className="text-xs sm:text-sm font-medium text-foreground/90 leading-relaxed italic">
                  "{t.comment}"
                </p>
              </div>

              {/* Author Footer */}
              <div className="mt-6 flex items-center gap-3 border-t border-border/60 pt-4">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-xs font-black shadow-xs ${t.avatarBg}`}
                >
                  {t.avatar}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-foreground truncate">{t.author}</h4>
                    <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate">{t.location}</p>
                  <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 truncate">
                    {t.route}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
