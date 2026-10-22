export default function CodingLaunchOrb() {
  return (
    <div className="coding-launch-orb" role="img" aria-label="Code is compiled, then launched live">
      <div className="orb-grid" aria-hidden="true" />
      <div className="orb-code-stage" aria-hidden="true">
        <p className="orb-label"><span className="orb-status-dot" />BUILDING</p>
        <div className="orb-window">
          <span><em>01</em><i>const</i> project = {'{'}</span>
          <span><em>02</em>&nbsp;&nbsp;status: <b>"ready"</b>,</span>
          <span><em>03</em>&nbsp;&nbsp;ship: <b>true</b></span>
          <span><em>04</em>{'}'}<strong>▋</strong></span>
        </div>
        <small><span className="orb-loader" />Compiling project</small>
      </div>
      <div className="orb-live-stage" aria-hidden="true">
        <span className="orb-rocket">🚀</span>
        <span className="orb-rocket-trail" />
        <p>Your code<br /><strong>is live</strong><span className="orb-cursor">_</span></p>
        <small>DEPLOY COMPLETE</small>
      </div>
      <span className="orb-ring orb-ring-one" aria-hidden="true" />
      <span className="orb-ring orb-ring-two" aria-hidden="true" />
    </div>
  );
}
