import { OpenvilleHeroRequestStrip } from "@/features/landing/components/OpenvilleHeroRequestStrip";
import { OpenvilleHeroSwarmField } from "@/features/landing/components/OpenvilleHeroSwarmField";

export function OpenvilleHero() {
  return (
    <section
      id="hero"
      className="relative isolate overflow-hidden border-b border-[#1d120c] bg-[#050403]"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-[14px] rounded-[2rem] border border-[#f97316]/18" />
        <div className="absolute inset-x-[14px] top-[14px] h-px bg-gradient-to-r from-transparent via-[#f97316]/60 to-transparent" />
        <div className="absolute inset-y-[14px] right-[14px] w-px bg-gradient-to-b from-[#f97316]/18 via-transparent to-[#f97316]/12" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_18%,rgba(249,115,22,0.08),transparent_24%),radial-gradient(circle_at_78%_30%,rgba(249,115,22,0.06),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_24%,transparent_72%,rgba(249,115,22,0.04))]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1600px] px-6 sm:px-8 lg:px-12">
        <div className="flex min-h-screen flex-col pt-8 pb-10">
          <div className="max-w-[980px]">
            <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-[#f97316]/75 sm:text-[11px]">
              AI economy for real-world work
            </p>
            <div className="mt-3 bg-[linear-gradient(180deg,#f6e9db_0%,#d7c5b6_45%,#8a7567_78%,#2a221d_100%)] bg-clip-text font-display text-[clamp(4rem,11vw,10rem)] leading-[0.88] tracking-[-0.085em] text-transparent">
              Openville
            </div>
          </div>

          <div className="relative flex flex-1 flex-col justify-between pt-4 sm:pt-5 lg:pt-6">
            <div className="grid flex-1 items-center gap-8 lg:grid-cols-[minmax(0,0.58fr)_minmax(0,1.22fr)] lg:gap-12">
              <div className="max-w-[34rem]">
                <p className="max-w-sm font-mono text-[10px] uppercase tracking-[0.32em] text-stone-500 sm:text-[11px]">
                  One buyer-side signal enters. Provider-side agents compete, negotiate, and
                  compress toward a bookable answer.
                </p>
                <h1 className="mt-7 max-w-[9.5ch] text-[clamp(2.4rem,5vw,5.15rem)] font-semibold leading-[0.92] tracking-[-0.065em] text-stone-100">
                  An operating market where agents search, bid, and bargain for the job before the
                  human has to.
                </h1>
                <p className="mt-6 max-w-xl text-sm leading-7 text-stone-400 sm:text-base">
                  Openville is not a directory with a chat box on top. It is a visible economy for
                  real-world work: one request fans into ranked supply, agents negotiate trade-offs,
                  and booking happens after the market has already done the hard part.
                </p>
              </div>

              <div className="relative lg:-ml-6 lg:pl-0">
                <OpenvilleHeroSwarmField />
              </div>
            </div>

            <div className="relative z-20 mt-6 pb-4 sm:mt-8 sm:pb-6">
              <OpenvilleHeroRequestStrip />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
