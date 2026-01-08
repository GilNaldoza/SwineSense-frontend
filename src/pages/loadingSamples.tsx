export default function LoadingSamples() {
  return (
    <div className="min-h-dvh w-full bg-gray-50 text-gray-900 flex items-center justify-center p-6">
      <style>{`
        .ls-container { background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); max-width: 1000px; width: 100%; }
        .ls-title { font-size: 22px; font-weight: 600; color: #111827; text-align: center; margin: 0 0 24px; }
        .ls-row { display: flex; gap: 40px; justify-content: center; align-items: center; margin-bottom: 28px; flex-wrap: wrap; }
        .ls-item { display: flex; flex-direction: column; align-items: center; gap: 10px; }
        .ls-item img { width: 64px; height: 64px; object-fit: contain; }
        .ls-item span { font-size: 12px; color: #6b7280; text-align: center; line-height: 1.2; }

        /* Animations */
        .flip-y { animation: flipY 2s ease-in-out infinite; transform-style: preserve-3d; }
        @keyframes flipY { 0% { transform: rotateY(0deg);} 100% { transform: rotateY(360deg);} }

        .flip-x { animation: flipX 2s ease-in-out infinite; transform-style: preserve-3d; }
        @keyframes flipX { 0% { transform: rotateX(0deg);} 100% { transform: rotateX(360deg);} }

        .flip-diagonal { animation: flipDiagonal 2.5s ease-in-out infinite; transform-style: preserve-3d; }
        @keyframes flipDiagonal { 0% { transform: rotate3d(1,1,0,0deg);} 100% { transform: rotate3d(1,1,0,360deg);} }

        .flip-fast { animation: flipYFast 1s linear infinite; transform-style: preserve-3d; }
        @keyframes flipYFast { 0% { transform: rotateY(0deg);} 100% { transform: rotateY(360deg);} }

        .flip-slow { animation: flipYSlow 3s ease-in-out infinite; transform-style: preserve-3d; }
        @keyframes flipYSlow { 0% { transform: rotateY(0deg);} 100% { transform: rotateY(360deg);} }

        .flip-wobble { animation: flipWobble 2s ease-in-out infinite; transform-style: preserve-3d; }
        @keyframes flipWobble { 0% { transform: perspective(400px) rotateY(0deg);} 50% { transform: perspective(400px) rotateY(180deg) scale(1.1);} 100% { transform: perspective(400px) rotateY(360deg);} }

        .ls-divider { height: 1px; background: #e5e7eb; margin: 22px 0; width: 100%; }
      `}</style>

      <div className="ls-container">
        <h2 className="ls-title">Loading Animations — Logo Variants</h2>

        <div className="ls-row">
          <div className="ls-item">
            <img src="/logo3.svg" alt="Logo flip Y" className="flip-y" />
            <span>Vertical Flip<br/>(Ballerina)</span>
          </div>
          <div className="ls-item">
            <img src="/logo2.svg" alt="Logo2 flip Y" className="flip-y" />
            <span>Flip Y</span>
          </div>
          <div className="ls-item">
            <img src="/logo3.svg" alt="Logo3 flip X" className="flip-x" />
            <span>Flip X</span>
          </div>
        </div>

        <div className="ls-divider" />

        <div className="ls-row">
          <div className="ls-item">
            <img src="/logo3.svg" alt="Logo fast" className="flip-fast" />
            <span>Fast Flip</span>
          </div>
          <div className="ls-item">
            <img src="/logo2.svg" alt="Logo2 slow" className="flip-slow" />
            <span>Slow Smooth</span>
          </div>
          <div className="ls-item">
            <img src="/logo3.svg" alt="Logo3 diagonal" className="flip-diagonal" />
            <span>Diagonal Flip</span>
          </div>
        </div>

        <div className="ls-divider" />

        <div className="ls-row">
          <div className="ls-item">
            <img src="/logo3.svg" alt="Logo wobble" className="flip-wobble" />
            <span>Wobble Flip<br/>(with scale)</span>
          </div>
          <div className="ls-item">
            <img src="/logo2.svg" alt="Logo2 flip Y" className="flip-y" />
            <span>Flip Y</span>
          </div>
          <div className="ls-item">
            <img src="/logo3.svg" alt="Logo3 flip Y" className="flip-y" />
            <span>Flip Y</span>
          </div>
        </div>
      </div>
    </div>
  )
}
