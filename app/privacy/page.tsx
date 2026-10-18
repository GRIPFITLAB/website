import type { Metadata } from "next";

import { externalLinks, siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: `How ${siteConfig.name} collects, uses, and protects your data.`,
};

const updated = "October 2026 (v1.2.0)";

const linkClass = "text-accent-bright underline-offset-4 hover:underline";

export default function PrivacyPage() {
  return (
    <article className="mx-auto w-full max-w-7xl px-5 py-20 md:px-10 md:py-28">
      <p className="text-eyebrow mb-6 text-text-tertiary">Privacy</p>
      <h1 className="font-display text-display-xl text-text-primary">
        Privacy policy
      </h1>

      <div className="mt-14 flex flex-col gap-10 text-[16px] leading-[1.8] text-text-secondary">
        <Section title="Scope">
          <p>
            This policy covers this website and the GripFit app. They collect
            different information, so each section below says which one it
            applies to.
          </p>
        </Section>

        <Section title="Information We Collect">
          <Subheading>On this website</Subheading>
          <p>
            If you enter your email address to lock in a Super Early Bird
            price or receive campaign updates, we store that address together
            with the code we issued you, the price set you were shown, the
            Super Early Bird price locked to your address, the date you signed
            up, the random visitor identifier described below, which sign-up
            form you used, and the campaign link (if any) that brought you to
            the site.
          </p>
          <p>
            If you use the contact form, we collect your name, email address,
            and your message.
          </p>
          <p>
            Like any website, our hosting provider processes the requests your
            browser makes, including your IP address, in its server logs. We
            also use your IP address briefly to limit how often our forms can
            be submitted, which protects them from abuse.
          </p>

          <Subheading>Cookies and price testing</Subheading>
          <p>
            Ahead of the Kickstarter campaign we test which prices to launch
            at. When you first visit, our server generates a random visitor
            identifier and assigns you at random to one of several fixed price
            sets. Both are stored in a signed first-party cookie named{" "}
            <code>gf_exp</code> (expires after 180 days) so that you see the
            same prices on every visit. The identifier is random and is not
            derived from your name, email, device, or IP address. We record
            that a visitor saw a given price set so we can compare sign-up
            rates between sets. The reward tiers published on Kickstarter when
            the campaign opens are the prices that apply to your pledge.
          </p>
          <p>
            If you arrive from an advert or a campaign link, we store the
            campaign, ad set, ad, and UTM parameters from that link in a
            second first-party cookie, <code>gf_attr</code> (180 days), so we
            can tell which campaigns lead to signups.
          </p>
          <p>
            We use the Meta Pixel and Meta&apos;s Conversions API to measure
            how our adverts perform. The Pixel sets Meta&apos;s own cookies
            (<code>_fbp</code>, <code>_fbc</code>) and reports page views and
            signups to Meta together with the assigned price set and the
            Super Early Bird price. When you sign
            up we also send Meta a one-way hash of your email address so it
            can match the signup to its advert without receiving your email
            address in readable form. We never send your email address, name,
            or message to Meta as plain text. You can opt out of Meta&apos;s
            use of this data in your{" "}
            <a
              href="https://www.facebook.com/adpreferences/ad_settings"
              className={linkClass}
              target="_blank"
              rel="noopener noreferrer"
            >
              Meta ad settings
            </a>
            , and block the Pixel with a content blocker; the site works
            fully without it.
          </p>
          <p>
            We use Vercel Web Analytics to count page views and see which
            pages people visit. It sets no cookies and does not identify you
            or follow you across other websites; visits are counted using a
            short-lived, anonymised value that is discarded within a day.
          </p>
          <p>
            A few preferences, such as whether you have dismissed the email
            sign-up pop-up or the cookie notice, are kept in your browser&apos;s local
            storage on your own device and are never sent to us.
          </p>

          <Subheading>In the GripFit app</Subheading>
          <p>
            GripFit collects grip strength measurement data, device connection
            information, and basic account details (email, display name) to
            provide and improve our services. You may optionally share your age
            and gender. We also collect usage events generated as you use the
            app, including app opens, session length, recording timestamps, and
            which hand you used; you can turn this off at any time with the
            Share Data switch in Settings. We collect data you provide directly
            when creating an account and data generated automatically through
            your use of the app, including grip force readings, session
            timestamps, and device identifiers.
          </p>
          <p>
            If the app crashes, a crash report is sent to us so we can fix the
            problem. It contains technical details about the crash and your
            device (model, operating system version, app version) together with
            your account identifier, and no other personal information. If you
            choose to send us feedback from Settings, we receive your message,
            its category, and your device model and operating system version so
            we can reproduce the issue. If you subscribe to GripFit Pro, we
            store the status of your subscription (plan, expiry, renewal)
            alongside your account; payment details are handled entirely by
            Apple and never reach us.
          </p>
        </Section>

        <Section title="How We Use Your Data">
          <p>
            Email addresses submitted on this website are used to keep a record
            of your locked Super Early Bird price, send you your code, and send
            occasional updates about the Kickstarter campaign. Every message
            includes an unsubscribe link. Contact form submissions are used to
            reply to you. Visitor identifiers, assigned price sets, and
            campaign parameters are used only in aggregate to understand
            demand at different prices and which adverts work.
          </p>
          <p>
            App data is used to display your grip strength history, track
            progress over time, and sync your recordings across devices.
            Optional age and gender, together with usage events, help us
            understand retention and how people use GripFit. Aggregated,
            anonymized data may be used to improve the app experience and
            develop new features.
          </p>
          <p>We do not sell your personal data to third parties.</p>
        </Section>

        <Section title="Data Storage & Security">
          <p>
            Email addresses and contact form messages submitted on this website
            are delivered through Brevo, our email provider, and stored in our
            own database on Google Firebase (Cloud Firestore) alongside the
            visitor identifier, assigned price set, locked price, and campaign
            parameters. Brevo also holds your locked price and code so it can
            send them to you. The
            website itself is hosted by Vercel.
          </p>
          <p>
            App data is stored using Google Firebase infrastructure with
            encryption in transit and at rest. Authentication is handled
            through Firebase Authentication.
          </p>
          <p>
            We implement industry-standard security measures to protect your
            information. No method of transmission or storage is completely
            secure, so we cannot guarantee absolute security.
          </p>
        </Section>

        <Section title="Data Retention & Deletion">
          <p>
            Email addresses and messages submitted on this website are kept for
            as long as they are needed for the Kickstarter campaign or to answer
            your enquiry, and your locked price is kept until the campaign
            closes so we can honor it. Price-test records are deleted or
            anonymised within
            12 months of the campaign closing. You can ask us to delete your
            data at any time by emailing <LegalEmail />.
          </p>
          <p>
            You may delete your app account and associated data at any time
            from Settings. Account deletion removes your profile, every
            recording, your usage analytics, and your subscription history from
            our servers immediately. Crash reports and feedback you have
            already sent are retained for up to 90 days for diagnostics and are
            not linked back to a deleted account.
          </p>
        </Section>

        <Section title="Third-Party Services">
          <p>
            This website uses{" "}
            <a
              href="https://www.brevo.com/legal/privacypolicy/"
              className={linkClass}
              target="_blank"
              rel="noopener noreferrer"
            >
              Brevo
            </a>{" "}
            to store contacts and send email, and{" "}
            <a
              href="https://vercel.com/legal/privacy-policy"
              className={linkClass}
              target="_blank"
              rel="noopener noreferrer"
            >
              Vercel
            </a>{" "}
            for hosting and cookieless page-view analytics,{" "}
            <a
              href="https://firebase.google.com/support/privacy"
              className={linkClass}
              target="_blank"
              rel="noopener noreferrer"
            >
              Google Firebase
            </a>{" "}
            for our database, and{" "}
            <a
              href="https://www.facebook.com/privacy/policy/"
              className={linkClass}
              target="_blank"
              rel="noopener noreferrer"
            >
              Meta
            </a>{" "}
            for advert measurement (Pixel and Conversions API). Pledges are
            placed through Kickstarter; if you back the campaign, Kickstarter
            collects your pledge and payment details under its own privacy
            policy.
          </p>
          <p>
            The GripFit app uses Google Firebase for authentication, data
            storage, and crash reporting (Firebase Crashlytics). You may sign
            in with an email address and password, with Google Sign-In, or with
            Sign in with Apple. Subscriptions are processed by Apple through
            the App Store.
          </p>
          <p>
            These services have their own privacy policies that govern their
            handling of your data. Beyond the Meta measurement described above,
            GripFit does not use advertising networks and does not track you
            across other companies&apos; apps or websites. The GripFit app
            contains no advertising trackers.
          </p>
        </Section>

        <Section title="Children & Updates">
          <p>
            GripFit is not directed to children under 13. We may update this
            policy from time to time; the date at the bottom of this page shows
            when it was last revised.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            If you have questions about this privacy policy, please contact us
            at <LegalEmail />.
          </p>
        </Section>
      </div>

      <p className="mt-14 border-t border-border-hairline pt-8 text-sm text-text-tertiary">
        Last updated: {updated}
      </p>
    </article>
  );
}

function LegalEmail() {
  return (
    <a href={`mailto:${externalLinks.legalEmail}`} className={linkClass}>
      {externalLinks.legalEmail}
    </a>
  );
}

function Subheading({ children }: { children: React.ReactNode }) {
  return <h3 className="font-medium text-text-primary">{children}</h3>;
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-4 border-t border-border-hairline pt-8 md:grid-cols-12">
      <h2 className="font-display text-display-sm text-text-primary md:col-span-4">
        {title}
      </h2>
      <div className="flex flex-col gap-3 md:col-span-8">{children}</div>
    </section>
  );
}
