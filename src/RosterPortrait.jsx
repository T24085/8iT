import { useEffect, useRef, useState } from 'react';

export function RosterPortrait({ portrait }) {
  const imageRef = useRef(null);
  const videoRef = useRef(null);
  const [inView, setInView] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const motionBase = portrait.replace('/players-hq/', '/players-motion/').replace(/\.png$/, '');

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onMotionChange = () => setReducedMotion(media.matches);
    onMotionChange();
    media.addEventListener('change', onMotionChange);

    const observer = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting);
      if (!entry.isIntersecting) setVideoReady(false);
    }, { rootMargin: '80px', threshold: 0.01 });
    if (imageRef.current) observer.observe(imageRef.current);
    return () => {
      observer.disconnect();
      media.removeEventListener('change', onMotionChange);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !inView || reducedMotion) return;
    video.load();
    video.play().catch(() => setVideoReady(false));
  }, [inView, reducedMotion]);

  return <>
    <img ref={imageRef} className="roster-card__portrait" src={portrait} alt="" aria-hidden="true" />
    {inView && !reducedMotion && <video
      ref={videoRef}
      className={`roster-card__portrait roster-card__portrait--motion${videoReady ? ' is-ready' : ''}`}
      autoPlay muted loop playsInline preload="auto" poster={portrait}
      aria-hidden="true" tabIndex={-1} disablePictureInPicture
      onPlaying={() => setVideoReady(true)} onError={() => setVideoReady(false)}
    >
      <source src={`${motionBase}.webm`} type="video/webm" />
      <source src={`${motionBase}.mp4`} type="video/mp4" />
    </video>}
  </>;
}
