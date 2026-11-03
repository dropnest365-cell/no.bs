import { LegalPage } from '../components/LegalPage';

export function TermsPage() {
  return (
    <LegalPage
      eyebrow="Terms of use"
      title="Plain terms for a practical tool."
      description="NO BS provides general business education and planning tools. It is not a law firm, accounting firm, financial adviser or market-research agency."
      updated="3 November 2026"
      sections={[
        {
          id: 'acceptance',
          title: 'Using the app',
          body: (
            <>
              <p>By creating an account or using the app, you agree to these terms. If you do not agree, do not use the app.</p>
              <p>You must provide accurate account information and keep your password secure. You are responsible for activity under your account.</p>
            </>
          ),
        },
        {
          id: 'information',
          title: 'General information only',
          body: (
            <>
              <p>All content is general information for educational and planning purposes. It is not legal, tax, accounting, financial, investment or professional advice.</p>
              <p>Business registration, licensing, tax and employment rules vary by country, state, activity and time. Always verify the current requirements with the relevant official portal or a qualified professional.</p>
            </>
          ),
        },
        {
          id: 'estimates',
          title: 'Estimates and no guarantees',
          body: (
            <>
              <p>Cost ranges, timelines and operational notes are planning estimates. They are not quotes, market statistics, loan offers or promises of income.</p>
              <p>NO BS does not guarantee that a business will launch, earn money, receive approvals or succeed. Any decision you make is your own. Test demand and keep a financial buffer before committing money.</p>
            </>
          ),
        },
        {
          id: 'accounts',
          title: 'Accounts and acceptable use',
          body: (
            <>
              <p>You may not:</p>
              <ul>
                <li>Attempt to access another user&apos;s account or admin areas without permission.</li>
                <li>Abuse, overload or probe the API, or bypass rate limits.</li>
                <li>Upload unlawful, misleading, infringing or harmful content.</li>
                <li>Use the app to impersonate a professional adviser or to make false claims about approvals or income.</li>
              </ul>
              <p>Accounts may be suspended or removed for abuse. Do not create multiple accounts to evade limits.</p>
            </>
          ),
        },
        {
          id: 'ai',
          title: 'AI and community content',
          body: (
            <>
              <p>AI-generated and rule-based answers can be incomplete, outdated or wrong. They are labelled by source and are not verified by a professional. Do not rely on them for legal, tax or financial decisions.</p>
              <p>Community answers are user-submitted drafts approved by an administrator. Approval is not professional verification and does not guarantee accuracy. Community content is labelled separately from editorial guides.</p>
            </>
          ),
        },
        {
          id: 'ip',
          title: 'Content and intellectual property',
          body: (
            <>
              <p>The app&apos;s text, design and code are provided for this project. Third-party names and links belong to their respective owners. You may not republish substantial content as your own without permission.</p>
              <p>You keep responsibility for content you submit. By submitting a draft for review, you allow the operator to publish it as a labelled community answer if approved.</p>
            </>
          ),
        },
        {
          id: 'links',
          title: 'Third-party links and tools',
          body: <p>Official portals and third-party tools are linked for convenience. We do not control them and are not responsible for their content, availability, pricing, security or terms. Listing a tool is not an endorsement or a paid placement.</p>,
        },
        {
          id: 'availability',
          title: 'Availability and changes',
          body: <p>The app may be changed, suspended or unavailable at any time, especially in this local/demo build. Features, content and these terms may be updated. Material changes should be reflected by a new date on this page.</p>,
        },
        {
          id: 'liability',
          title: 'Limitation of liability',
          body: <p>To the maximum extent permitted by applicable law, the operator is not liable for indirect, incidental or consequential losses, lost profits, lost data or business failure arising from use of the app. Nothing here excludes liability that cannot lawfully be excluded.</p>,
        },
        {
          id: 'law',
          title: 'Governing law and contact',
          body: (
            <>
              <p>These terms are intended to be governed by the laws of India, without prejudice to mandatory consumer protections that apply where you live.</p>
              <p>Questions about these terms: use the <a href="/contact">contact page</a>.</p>
            </>
          ),
        },
      ]}
    />
  );
}
