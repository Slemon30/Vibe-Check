import React, { useState, useEffect } from 'react';
import { questions } from './Questions';
import { vibes } from './Vibes';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from "html2canvas";

export default function VibeCheckQuiz() {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);

  useEffect(() => {
    if (result) {
      document.body.style.backgroundColor = result.color;
      document.body.style.backgroundImage = 'none';
    } else {
      document.body.style.backgroundColor = '';
      document.body.style.backgroundImage = 'linear-gradient(to bottom right, #EEF2FF, #FAF5FF)';
    }

    return () => {
      document.body.style.backgroundColor = '';
      document.body.style.backgroundImage = '';
    };
  }, [result]);

  // Update progress bar
  useEffect(() => {
    setProgress(((currentQ + 1) / questions.length) * 100);
  }, [currentQ]);

  const handleAnswer = (vibes) => {
    setAnswers([...answers, ...vibes]);
    const nextQ = currentQ + 1;

    if (nextQ < questions.length) {
      setCurrentQ(nextQ);
    } else {
      setIsCalculating(true);
      setTimeout(() => {
        calculateResult([...answers, ...vibes]);
        setIsCalculating(false);
      }, 1500); // Simulate calculation time
    }
  };
  function darkenColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = (num >> 8 & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;

    return `#${(
      0x1000000 +
      (R > 0 ? (R < 255 ? R : 255) : 0) * 0x10000 +
      (G > 0 ? (G < 255 ? G : 255) : 0) * 0x100 +
      (B > 0 ? (B < 255 ? B : 255) : 0)
    ).toString(16).slice(1)}`;
  }
  function lightenColor(color, percent) {
    // Convert hex to RGB
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;

    return `#${(
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    ).toString(16).slice(1)}`;
  }
  function getContrastColor(hexColor) {
    // Convert hex to RGB
    const r = parseInt(hexColor.substr(1, 2), 16);
    const g = parseInt(hexColor.substr(3, 2), 16);
    const b = parseInt(hexColor.substr(5, 2), 16);

    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Return black or white depending on luminance
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  }
  const calculateResult = (finalAnswers) => {
    const tally = {};
    finalAnswers.forEach((v) => {
      tally[v] = (tally[v] || 0) + 1;
    });
    const topVibe = Object.keys(tally).reduce((a, b) => (tally[a] > tally[b] ? a : b));
    setResult(vibes[topVibe]);
  };

  const resetQuiz = () => {
    setCurrentQ(0);
    setAnswers([]);
    setResult(null);
    setProgress(0);
  };

  const shareResult = async () => {
    try {
      // Create a canvas from the result card
      const element = document.querySelector('.result-card');
      const canvas = await html2canvas(element, {
        backgroundColor: null,
        scale: 2 // Higher quality
      });

      // Convert canvas to image
      const image = canvas.toDataURL('image/png');

      // Create share data
      const shareData = {
        title: `I'm a ${result.name} vibe!`,
        text: `I just took the Vibe Check Quiz and discovered I'm a ${result.name}! Find out your vibe too.`,
        url: window.location.href,
        files: [new File([dataURLtoBlob(image)], 'vibe-result.png', { type: 'image/png' })]
      };

      // Try native share API first
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: show share options
        setShowShareOptions(true);
      }
    } catch (err) {
      console.error('Error sharing:', err);
      // Fallback: show share options
      setShowShareOptions(true);
    }
  };

  // Helper function to convert data URL to blob
  const dataURLtoBlob = (dataURL) => {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  const shareToPlatform = (platform) => {
    const text = `I just took the Vibe Check Quiz and discovered I'm a ${result.name}! Find out your vibe too.`;
    const url = window.location.href;
    const hashtags = 'VibeCheck,PersonalityQuiz';

    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=${hashtags}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`, '_blank');
        break;
      default:
        break;
    }
  };

  if (isCalculating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8 max-w-md"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-6"
          />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Calculating Your Vibe</h2>
          <p className="text-gray-600">We're analyzing your answers to find your perfect match...</p>
        </motion.div>
      </div>
    );
  }

  if (result) {
    return (
      <div
        className="min-h-screen transition-colors duration-500 flex items-center justify-center p-4"
        style={{ backgroundColor: result.color }}
      >
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{
              opacity: 1,
              scale: 1,
              transition: { type: 'spring', damping: 10, stiffness: 100 }
            }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center w-full max-w-2xl"
          >
            {/* Glossy Card Container */}
            <div className="relative w-full overflow-hidden">
              {/* Floating decorative elements */}
              <motion.div
                animate={{
                  rotate: 360,
                  transition: { duration: 20, repeat: Infinity, ease: "linear" }
                }}
                className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-10 blur-xl"
                style={{ backgroundColor: lightenColor(result.color, 30) }}
              />
              <motion.div
                animate={{
                  rotate: -360,
                  transition: { duration: 25, repeat: Infinity, ease: "linear" }
                }}
                className="absolute -bottom-16 -left-16 w-32 h-32 rounded-full opacity-10 blur-xl"
                style={{ backgroundColor: lightenColor(result.color, 20) }}
              />

              {/* Main Card */}
              <div
                className="relative rounded-3xl shadow-2xl overflow-hidden backdrop-blur-sm border border-white/20 result-card"
                style={{
                  backgroundColor: `${result.color}80`,
                  boxShadow: `0 20px 40px ${darkenColor(result.color, 20)}40`
                }}
              >
                {/* Glossy overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 pointer-events-none" />

                <div className="p-8 text-center relative z-10">
                  {/* Animated Emoji Badge */}
                  <motion.div
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{
                      scale: 1,
                      rotate: 0,
                      transition: { type: 'spring', damping: 10, stiffness: 200 }
                    }}
                    whileHover={{ scale: 1.1, rotate: [0, 10, -10, 0] }}
                    className="w-28 h-28 mx-auto mb-6 rounded-2xl flex items-center justify-center text-5xl font-bold shadow-lg"
                    style={{
                      backgroundColor: lightenColor(result.color, 15),
                      color: getContrastColor(lightenColor(result.color, 15)),
                      boxShadow: `0 8px 20px ${darkenColor(result.color, 15)}80`
                    }}
                  >
                    {result.emoji}
                  </motion.div>

                  {/* Title with animated underline */}
                  <div className="mb-8">
                    <h1 className="text-4xl font-extrabold mb-2 tracking-tight">
                      You're a<br />
                      <motion.span
                        className="block bg-clip-text text-transparent bg-gradient-to-r from-white to-white/90"
                        style={{ fontSize: '3.5rem', lineHeight: '1' }}
                      >
                        {result.name}
                      </motion.span>
                    </h1>

                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 0.3 }}
                      className="h-1 mx-auto w-24 mt-4 rounded-full"
                      style={{ backgroundColor: lightenColor(result.color, 40) }}
                    />
                  </div>

                  {/* Description */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-lg mb-8 leading-relaxed max-w-lg mx-auto"
                    style={{ color: lightenColor(result.color, 60) }}
                  >
                    {result.description}
                  </motion.p>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                      <h3 className="text-sm font-semibold uppercase tracking-wider mb-3">Strengths</h3>
                      <ul className="space-y-2">
                        {result.strengths.map((strength, i) => (
                          <motion.li
                            key={i}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.3 + i * 0.1 }}
                            className="flex items-center"
                          >
                            <span className="mr-2">✨</span> {strength}
                          </motion.li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                      <h3 className="text-sm font-semibold uppercase tracking-wider mb-3">Weaknesses</h3>
                      <ul className="space-y-2">
                        {result.weaknesses.map((weakness, i) => (
                          <motion.li
                            key={i}
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.3 + i * 0.1 }}
                            className="flex items-center"
                          >
                            <span className="mr-2">⚠️</span> {weakness}
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Spirit Animal */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="inline-block px-6 py-2 rounded-full mb-8"
                    style={{
                      backgroundColor: lightenColor(result.color, 20),
                      color: getContrastColor(lightenColor(result.color, 20))
                    }}
                  >
                    <span className="font-bold">Spirit Animal:</span> {result.spiritAnimal}
                  </motion.div>

                  {/* CTA Buttons */}
                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={resetQuiz}
                      className="px-8 py-4 rounded-full font-bold text-lg tracking-wide flex-1 shadow-lg"
                      style={{
                        backgroundColor: lightenColor(result.color, 40),
                        color: getContrastColor(lightenColor(result.color, 40)),
                        boxShadow: `0 4px 15px ${darkenColor(result.color, 10)}80`
                      }}
                    >
                      Retake Quiz
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => shareResult()}
                      className="px-8 py-4 rounded-full font-bold text-lg tracking-wide flex-1 shadow-lg flex items-center justify-center"
                      style={{
                        backgroundColor: darkenColor(result.color, 10),
                        color: getContrastColor(darkenColor(result.color, 10)),
                        boxShadow: `0 4px 15px ${darkenColor(result.color, 20)}80`
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      Share
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
        {showShareOptions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowShareOptions(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-4">Share Your Vibe</h3>
              <div className="grid gap-4">
                <button
                  onClick={() => shareToPlatform('twitter')}
                  className="flex items-center justify-center p-3 bg-blue-400 text-white rounded-lg"
                >
                  <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                  X
                </button>
                <button
                  onClick={() => shareToPlatform('facebook')}
                  className="flex items-center justify-center p-3 bg-blue-600 text-white rounded-lg"
                >
                  <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                  </svg>
                  Facebook
                </button>
                
                <button
                  onClick={() => shareToPlatform('whatsapp')}
                  className="flex items-center justify-center p-3 bg-green-500 text-white rounded-lg"
                >
                  <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp
                </button>
              </div>
              <button
                onClick={() => setShowShareOptions(false)}
                className="mt-4 w-full py-2 bg-gray-200 rounded-lg"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </div>
    );
  }
  const q = questions[currentQ];

  return (
    <>
      <h1 className="text-6xl font-bold text-indigo-800">Vibe Check Quiz</h1>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 p-4">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-md w-full"
        >
          {/* Box heading */}
          <div className="bg-indigo-600 p-4">
            <h2 className="text-xl font-bold text-white text-center">Discover Your Vibe</h2>
          </div>
          {/* Progress bar */}
          <div className="h-1.5 bg-gray-200">
            <motion.div
              className="h-full bg-indigo-600"
              initial={{ width: `${progress}%` }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <span className="text-sm font-medium text-indigo-600">Vibe Check</span>
              <span className="text-sm text-gray-500">{currentQ + 1}/{questions.length}</span>
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-6">{q.question}</h2>

            <div className="space-y-3">
              {q.options.map((opt, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full p-4 border border-gray-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 transition-all text-left"
                  onClick={() => handleAnswer(opt.vibes)}
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3">
                      {String.fromCharCode(65 + i)}
                    </div>
                    <span className="font-medium text-gray-800">{opt.text}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          <div className="px-8 pb-8 pt-4 bg-gray-50">
            <div className="flex items-center justify-between">
              <button
                onClick={() => currentQ > 0 && setCurrentQ(currentQ - 1)}
                disabled={currentQ === 0}
                className={`px-4 py-2 rounded-lg ${currentQ === 0 ? 'text-gray-400' : 'text-indigo-600 hover:bg-indigo-100'}`}
              >
                Back
              </button>
              <div className="text-sm text-gray-500">
                Question {currentQ + 1} of {questions.length}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}