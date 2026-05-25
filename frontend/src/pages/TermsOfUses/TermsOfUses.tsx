import "./TermsOfUses.scss";

import React from "react";

const TermsOfUses: React.FC = () => {
  return (
    <div className="terms">
      <h1 className="title">TERMS OF USE</h1>
      <p className="lastUpdated">Last updated: March 20, 2026</p>

      <div className="content">
        <div className="chapter">
          <h2 className="chapterTitle">1. Scope</h2>
          <p className="chapterText">
            This website template is provided as-is for demonstration and
            development purposes. You are responsible for adapting content,
            legal pages, and configuration before production use.
          </p>
        </div>

        <div className="chapter">
          <h2 className="chapterTitle">2. Intellectual Property</h2>
          <p className="chapterText">
            Unless specified otherwise, source code and assets in this template
            are licensed under the project license. Third-party dependencies
            remain under their respective licenses.
          </p>
        </div>

        <div className="chapter">
          <h2 className="chapterTitle">3. Liability</h2>
          <p className="chapterText">
            The maintainers provide no warranty of any kind. Use this template
            at your own risk and validate all behavior before deploying to
            production.
          </p>
        </div>

        <div className="chapter">
          <h2 className="chapterTitle">4. Contact</h2>
          <p className="chapterText">
            Replace this section with your own legal contact details before
            public release.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfUses;
