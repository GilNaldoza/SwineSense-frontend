import { useState, useMemo, useEffect } from 'react'

type Props = {
  size?: number | string
  className?: string
  alt?: string
  title?: string
  duration?: number
  // Optional: override logo source (defaults to /logo2.svg)
  src?: string
}

export default function WobbleFlipLoader({
  size = 64,
  className = '',
  alt = 'Loading...',
  title,
  duration,
  src: srcProp,
}: Props) {
  const [src, setSrc] = useState<string>(srcProp ?? '/logo2.svg')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [failedOnce, setFailedOnce] = useState(false)

  const pxSize = useMemo(() => (typeof size === 'number' ? `${size}px` : size), [size])
  // Default a bit faster than before (1.3s vs 2s)
  const dur = typeof duration === 'number' && duration > 0 ? duration : 1.3

  // Sync image source when parent changes `src`
  useEffect(() => {
    if (srcProp) {
      setSrc(srcProp)
    } else {
      setSrc('/logo2.svg')
    }
    setErrorMsg(null)
    setFailedOnce(false)
  }, [srcProp])

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (!failedOnce) {
      setErrorMsg(`Failed to load: ${e.currentTarget.src}`)
      setSrc('/logo3.svg')
      setFailedOnce(true)
    } else {
      setErrorMsg(`Also failed to load fallback: ${e.currentTarget.src}`)
    }
  }

  return (
    <div className={`flex flex-col items-center ${className}`} role="status" aria-live="polite">
      <style>{`
        .flip-wobble { animation: flipWobble 2s ease-in-out infinite; transform-style: preserve-3d; backface-visibility: hidden; }
        @keyframes flipWobble {
          0% { transform: perspective(400px) rotateY(0deg); }
          50% { transform: perspective(400px) rotateY(180deg) scale(1.1); }
          100% { transform: perspective(400px) rotateY(360deg); }
        }
      `}</style>
      <img
        src={src}
        onError={handleError}
        alt={alt}
        title={title}
        draggable={false}
        className="flip-wobble select-none"
        style={{ width: pxSize, height: pxSize, objectFit: 'contain', animationDuration: `${dur}s` }}
      />
      {errorMsg && (
        <p className="mt-2 text-sm text-red-600" data-testid="loader-error">
          {errorMsg}
        </p>
      )}
    </div>
  )
}
