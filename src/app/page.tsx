"use client";
import React, { useEffect, useState } from "react";

interface Coin {
  id: number;
  x: number;
  y: number;
}

const CoinGame: React.FC = () => {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [score, setScore] = useState(0);
  const [nextId, setNextId] = useState(0);
  const [coinsPerSecond, setCoinsPerSecond] = useState(0);
  const [secretCode, setSecretCode] = useState("");
  const [usedCodes, setUsedCodes] = useState<string[]>([]);
  const [codeFeedback, setCodeFeedback] = useState<"none" | "success" | "error">("none");
  const [coinMultiplier, setCoinMultiplier] = useState(1);
  const [goldenCoin, setGoldenCoin] = useState<Coin | null>(null);
  const [frenzyActive, setFrenzyActive] = useState(false);
  const [frenzyTimeLeft, setFrenzyTimeLeft] = useState(0);

  useEffect(() => {
    const savedScore = localStorage.getItem("score");
    const savedCPS = localStorage.getItem("coinsPerSecond");
    const savedNextId = localStorage.getItem("nextId");
    const savedUsedCodes = localStorage.getItem("usedCodes");
    const savedMultiplier = localStorage.getItem("coinMultiplier");

    if (savedScore) setScore(Number(savedScore));
    if (savedCPS) setCoinsPerSecond(Number(savedCPS));
    if (savedNextId) setNextId(Number(savedNextId));
    if (savedUsedCodes) setUsedCodes(JSON.parse(savedUsedCodes));
    if (savedMultiplier) setCoinMultiplier(Number(savedMultiplier));
  }, []);

  useEffect(() => localStorage.setItem("score", score.toString()), [score]);
  useEffect(() => localStorage.setItem("coinsPerSecond", coinsPerSecond.toString()), [coinsPerSecond]);
  useEffect(() => localStorage.setItem("nextId", nextId.toString()), [nextId]);
  useEffect(() => localStorage.setItem("usedCodes", JSON.stringify(usedCodes)), [usedCodes]);
  useEffect(() => localStorage.setItem("coinMultiplier", coinMultiplier.toString()), [coinMultiplier]);

  useEffect(() => {
    const interval = setInterval(() => {
      const x = Math.random() * 90;
      const y = Math.random() * 80;
      setCoins((prev) => [...prev, { id: nextId, x, y }]);
      setNextId((id) => id + 1);
    }, 1500);
    return () => clearInterval(interval);
  }, [nextId]);

  useEffect(() => {
    const interval = setInterval(() => {
      setScore((prev) => prev + coinsPerSecond);
    }, 1000);
    return () => clearInterval(interval);
  }, [coinsPerSecond]);

  useEffect(() => {
    if (frenzyActive && frenzyTimeLeft > 0) {
      const timer = setTimeout(() => setFrenzyTimeLeft(frenzyTimeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (frenzyTimeLeft === 0) {
      setFrenzyActive(false);
    }
  }, [frenzyActive, frenzyTimeLeft]);

  const collectCoin = (id: number) => {
    setCoins((prev) => prev.filter((c) => c.id !== id));
    if (Math.random() < 0.05 && !frenzyActive && !goldenCoin) {
      const x = Math.random() * 90;
      const y = Math.random() * 80;
      setGoldenCoin({ id: nextId, x, y });
      setNextId((id) => id + 1);
    }
    setScore((prev) => prev + 1 * coinMultiplier);
  };

  const collectGoldenCoin = () => {
    setGoldenCoin(null);
    setFrenzyActive(true);
    setFrenzyTimeLeft(5);
  };

  const buyUpgrade = () => {
    if (score >= 80) {
      setScore((prev) => prev - 80);
      setCoinsPerSecond((prev) => prev + 10);
    }
  };

  const checkSecretCode = () => {
    if (usedCodes.includes(secretCode)) {
      setCodeFeedback("error");
    } else if (secretCode === "coinbag123") {
      setScore((prev) => prev + 1_000_000_000);
      setUsedCodes((prev) => [...prev, secretCode]);
      setCodeFeedback("success");
    } else if (secretCode === "coinrush125") {
      setFrenzyActive(true);
      setFrenzyTimeLeft(30);
      setUsedCodes((prev) => [...prev, secretCode]);
      setCodeFeedback("success");
    } else {
      setCodeFeedback("error");
    }
    setTimeout(() => setCodeFeedback("none"), 1000);
  };

  const resetGame = () => {
    if (window.confirm("Are you sure you want to reset all progress?")) {
      setScore(0);
      setCoins([]);
      setNextId(0);
      setCoinsPerSecond(0);
      setSecretCode("");
      setUsedCodes([]);
      setCodeFeedback("none");
      setCoinMultiplier(1);
      setGoldenCoin(null);
      setFrenzyActive(false);
      setFrenzyTimeLeft(0);
      localStorage.clear();
    }
  };

  const buyMultiplier = (multiplier: number, cost: number) => {
    if (coinMultiplier >= multiplier || score < cost) return;
    setScore((prev) => prev - cost);
    setCoinMultiplier(multiplier);
  };

  const handleClick = () => {
    setScore((prev) => prev + (frenzyActive ? 50 : 0));
  };

  return (
    <div
      className={`relative w-full h-screen overflow-hidden font-sans transition-all duration-500 px-2 sm:px-4 py-4 sm:py-6 ${
        frenzyActive
          ? "bg-yellow-300 bg-gradient-to-br from-yellow-300 to-yellow-100"
          : "bg-gradient-to-br from-yellow-100 to-yellow-300"
      }`}
      onClick={handleClick}
    >
      <h1 className="absolute top-4 left-1/2 transform -translate-x-1/2 text-2xl sm:text-4xl font-extrabold text-yellow-900 drop-shadow-xl animate-bounce">
        💰 Coins: {score}
      </h1>

      <button
        onClick={resetGame}
        className="absolute top-4 left-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-xl shadow-md transition-transform hover:scale-110"
      >
        🔄 Reset
      </button>

      <button
        onClick={buyUpgrade}
        disabled={score < 80}
        className={`absolute top-20 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-xl font-bold shadow-md transition-all duration-300 text-sm sm:text-base hover:scale-105 ${
          score < 80
            ? "bg-yellow-400 opacity-50 cursor-not-allowed"
            : "bg-yellow-500 hover:bg-yellow-600 animate-glow"
        }`}
      >
        🚀 +10 Coins/sec (Cost: 80)
      </button>

      <p className="absolute top-32 left-1/2 transform -translate-x-1/2 text-base font-semibold text-yellow-800">
        🔄 Coins/sec: {coinsPerSecond}
      </p>

      <div className="absolute top-4 right-2 w-11/12 max-w-xs bg-white bg-opacity-90 p-4 rounded-xl shadow-lg flex flex-col items-center gap-2 animate-slide-in">
        <input
          type="text"
          placeholder="Enter code"
          value={secretCode}
          onChange={(e) => setSecretCode(e.target.value)}
          className={`w-full px-3 py-2 rounded border-2 font-medium text-yellow-900 outline-none transition-all duration-200 text-sm sm:text-base ${
            codeFeedback === "success"
              ? "border-green-400 bg-green-100"
              : codeFeedback === "error"
              ? "border-red-400 bg-red-100"
              : "border-yellow-400"
          }`}
        />
        <button
          onClick={checkSecretCode}
          className="w-full bg-yellow-400 text-yellow-900 px-3 py-2 rounded font-bold hover:bg-yellow-500 transition text-sm sm:text-base"
        >
          ✅ Redeem
        </button>
      </div>

      <div className="absolute top-1/2 right-2 transform -translate-y-1/2 w-11/12 max-w-xs bg-white bg-opacity-90 p-4 rounded-xl shadow-lg flex flex-col gap-2 animate-slide-in">
        <h2 className="text-lg font-bold text-yellow-900 text-center">💥 Multipliers</h2>
        {[2, 3, 4, 5].map((multiplier) => {
          const cost = multiplier * 100;
          const owned = coinMultiplier >= multiplier;
          return (
            <button
              key={multiplier}
              onClick={() => buyMultiplier(multiplier, cost)}
              disabled={score < cost || owned}
              className={`px-4 py-2 rounded font-semibold transition-all duration-200 text-sm sm:text-base ${
                owned
                  ? "bg-green-300 text-green-800 cursor-default"
                  : score < cost
                  ? "bg-yellow-200 text-yellow-500 cursor-not-allowed"
                  : "bg-yellow-400 text-yellow-900 hover:bg-yellow-500"
              }`}
            >
              {owned ? `✅ ${multiplier}x Owned` : `🔥 ${multiplier}x Click - ${cost} Coins`}
            </button>
          );
        })}
      </div>

      {frenzyActive && frenzyTimeLeft === 30 && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-4 h-4 bg-yellow-300 rounded-full animate-particle"
              style={{
                left: "50%",
                top: "50%",
                transform: `translate(-50%, -50%) rotate(${i * 18}deg) translateY(-100px)`,
              }}
            />
          ))}
        </div>
      )}

      {frenzyActive && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-xl sm:text-2xl font-bold text-orange-700 bg-white bg-opacity-80 px-4 py-2 rounded-xl shadow-lg animate-pulse">
          🔥 Frenzy Mode! {frenzyTimeLeft}s left!
        </div>
      )}

      {goldenCoin && (
        <div
          key={goldenCoin.id}
          onClick={collectGoldenCoin}
          className="absolute w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-yellow-500 border-4 border-yellow-300 shadow-2xl animate-fade-in hover:scale-125 transition-transform cursor-pointer"
          style={{ left: `${goldenCoin.x}%`, top: `${goldenCoin.y}%` }}
        >
          <div className="w-full h-full flex items-center justify-center text-3xl sm:text-4xl font-bold text-yellow-800">
            🌟
          </div>
        </div>
      )}

      {coins.map((coin) => (
        <div
          key={coin.id}
          onClick={() => collectCoin(coin.id)}
          className="absolute w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-yellow-400 border-2 border-yellow-300 shadow-lg animate-fade-in animate-spin-slow hover:scale-125 hover:animate-pulse transition-transform cursor-pointer"
          style={{ left: `${coin.x}%`, top: `${coin.y}%` }}
        >
          <div className="w-full h-full flex items-center justify-center text-xl sm:text-2xl font-bold text-yellow-700">
            🪙
          </div>
        </div>
      ))}

      <style jsx>{`
        @keyframes fade-in {
          0% {
            opacity: 0;
            transform: scale(0.5);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes glow {
          0%, 100% {
            box-shadow: 0 0 12px rgba(255, 215, 0, 0.6);
          }
          50% {
            box-shadow: 0 0 24px rgba(255, 215, 0, 1);
          }
        }

        @keyframes slide-in {
          0% {
            transform: translateX(100%) scale(0.8);
            opacity: 0;
          }
          100% {
            transform: translateX(0) scale(1);
            opacity: 1;
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes particle {
          0% {
            transform: scale(0.5) translateY(0);
            opacity: 1;
          }
          100% {
            transform: scale(1.5) translateY(-200px);
            opacity: 0;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.4s ease-out forwards;
        }

        .animate-glow {
          animation: glow 1.5s ease-in-out infinite;
        }

        .animate-slide-in {
          animation: slide-in 0.6s ease-out forwards;
        }

        .animate-spin-slow {
          animation: spin-slow 6s linear infinite;
        }

        .animate-particle {
          animation: particle 1s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default CoinGame;
