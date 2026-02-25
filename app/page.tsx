import { redirect } from "next/navigation";
import { stackServerApp } from "@/stack/server";
import Image from "next/image";
import Link from "next/link";

export default async function Home() {
  const user = await stackServerApp.getUser();

  if (user) {
    const role = (user.serverMetadata as any)?.role;
    if (!role) redirect("/onboarding");
    redirect(role === "doctor" ? "/doctor" : "/patient");
  }

  return (
    <div>
      {/* Hero — exactly one screen */}
      <div className="relative h-dvh">
        <Image
          src="/macimed.png"
          alt="mAcI med"
          fill
          priority
          className="object-cover"
        />

        {/* Nav buttons */}
        <nav className="relative z-10 flex items-center justify-center gap-4 px-4 pt-6 sm:gap-6 sm:px-6 sm:pt-8">
          <a
            href="#the-difference"
            className="rounded-full bg-white/90 px-4 py-2 text-xs font-semibold text-primary shadow-lg backdrop-blur transition hover:bg-white hover:shadow-xl sm:px-6 sm:py-2.5 sm:text-sm"
          >
            The Difference
          </a>
          <Link
            href="/handler/sign-in"
            className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white shadow-lg transition hover:bg-primary-dark hover:shadow-xl sm:px-6 sm:py-2.5 sm:text-sm"
          >
            Sign In
          </Link>
        </nav>

        {/* Tagline pinned to bottom of hero */}
        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-end px-6 pb-16 sm:pb-24">
          <p className="text-center text-base font-medium text-white drop-shadow-lg sm:text-lg">
            Medicine, exactly when you need it.
          </p>
        </div>
      </div>

      {/* The Difference — marketing section */}
      <section id="the-difference" className="bg-white px-4 py-12 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-3xl space-y-12 sm:space-y-16">

          {/* Headline */}
          <div className="text-center space-y-3 sm:space-y-4">
            <h2 className="text-3xl font-bold text-primary sm:text-4xl">The Difference</h2>
            <p className="text-base text-text-secondary sm:text-lg">
              No waiting rooms. No appointments. No runaround.<br />
              Just a doctor, your phone, and the care you actually need.
            </p>
          </div>

          {/* Value props */}
          <div className="grid gap-8 sm:grid-cols-3 sm:gap-10">
            <div className="space-y-3 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-xl sm:h-14 sm:w-14 sm:text-2xl">
                &#128337;
              </div>
              <h3 className="text-base font-semibold text-text sm:text-lg">Care in Minutes, Not Weeks</h3>
              <p className="text-sm text-text-secondary">
                Describe your symptoms, upload a photo if needed, and a licensed Oklahoma physician reviews your case — usually within the hour.
              </p>
            </div>
            <div className="space-y-3 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-xl sm:h-14 sm:w-14 sm:text-2xl">
                &#128176;
              </div>
              <h3 className="text-base font-semibold text-text sm:text-lg">Transparent, Fair Pricing</h3>
              <p className="text-sm text-text-secondary">
                One flat consultation fee. No hidden charges. No insurance headaches. You see the price before you pay — every time.
              </p>
            </div>
            <div className="space-y-3 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-xl sm:h-14 sm:w-14 sm:text-2xl">
                &#128138;
              </div>
              <h3 className="text-base font-semibold text-text sm:text-lg">Prescriptions That Don&apos;t Break the Bank</h3>
              <p className="text-sm text-text-secondary">
                We automatically find the lowest price for your medication using real-time discount sourcing — often saving you 80% or more versus retail pharmacy prices.
              </p>
            </div>
          </div>

          {/* Subscription pitch */}
          <div className="rounded-2xl bg-surface p-6 text-center space-y-6 sm:rounded-3xl sm:p-12">
            <h3 className="text-xl font-bold text-text sm:text-2xl">The mAcI med Membership</h3>
            <p className="text-sm text-text-secondary max-w-xl mx-auto sm:text-base">
              For patients who need ongoing care, our memberships keep costs predictable.
              Priority physician review, and exclusive access to
              our prescription savings engine that sources the deepest discounts available —
              every refill, every time.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <div className="w-full rounded-2xl border border-border bg-white px-6 py-5 space-y-1 sm:w-auto sm:px-8 sm:py-6">
                <p className="text-sm font-medium text-text-secondary">Per Visit</p>
                <p className="text-3xl font-bold text-text">$69</p>
                <p className="text-xs text-text-secondary">No commitment</p>
              </div>
              <div className="w-full rounded-2xl border-2 border-primary bg-white px-6 py-5 space-y-1 shadow-lg sm:w-auto sm:px-8 sm:py-6">
                <p className="text-sm font-medium text-primary">Individual</p>
                <p className="text-3xl font-bold text-text">$99<span className="text-base font-normal text-text-secondary">/mo</span></p>
                <p className="text-xs text-text-secondary">Up to 3 visits per month</p>
              </div>
              <div className="w-full rounded-2xl border-2 border-primary bg-white px-6 py-5 space-y-1 shadow-lg sm:w-auto sm:px-8 sm:py-6">
                <p className="text-sm font-medium text-primary">Family</p>
                <p className="text-3xl font-bold text-text">$199<span className="text-base font-normal text-text-secondary">/mo</span></p>
                <p className="text-xs text-text-secondary">Up to 8 visits per month</p>
              </div>
            </div>
          </div>

          {/* How it works */}
          <div className="space-y-6 sm:space-y-8">
            <h3 className="text-xl font-bold text-text text-center sm:text-2xl">How It Works</h3>
            <div className="grid gap-6 sm:grid-cols-3">
              <div className="flex flex-col items-center gap-3 text-center">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white font-bold">1</span>
                <p className="text-sm text-text-secondary">
                  <strong className="text-text">Tell us what&apos;s going on.</strong><br />
                  Answer a few questions and share any relevant photos — takes about two minutes.
                </p>
              </div>
              <div className="flex flex-col items-center gap-3 text-center">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white font-bold">2</span>
                <p className="text-sm text-text-secondary">
                  <strong className="text-text">A real doctor reviews your case.</strong><br />
                  A licensed Oklahoma physician evaluates your request and responds — no bots, no algorithms.
                </p>
              </div>
              <div className="flex flex-col items-center gap-3 text-center">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white font-bold">3</span>
                <p className="text-sm text-text-secondary">
                  <strong className="text-text">Pick up your prescription.</strong><br />
                  If appropriate, your prescription is sent to your pharmacy — with the best discount we can find already applied.
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center space-y-4 pb-4 sm:pb-8">
            <p className="text-base text-text-secondary sm:text-lg">Ready to skip the waiting room?</p>
            <Link
              href="/handler/sign-in"
              className="inline-block rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-primary-dark hover:shadow-xl sm:px-10 sm:py-3.5 sm:text-base"
            >
              Get Started
            </Link>
          </div>

        </div>
      </section>
    </div>
  );
}
