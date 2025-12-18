import { useState, useEffect } from 'react';
import { Copy, Facebook, Twitter, Mail, Check, Gift, Users, Award } from 'lucide-react';

interface UserProfile {
  id: string;
  referral_code: string;
  referred_by: string | null;
  referral_count: number;
  referral_points: number;
  is_premium: boolean;
  rewards_claimed: string[];
}

interface ReferralPageProps {
  onNavigate?: (page: string) => void;
}

export default function ReferralPage({ onNavigate }: ReferralPageProps = {}) {
  const user = { id: 'demo-user' };
  const [copied, setCopied] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<number | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    if (!user) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/referrals/me`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('vpreme_token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.user) {
          setProfile({
            id: data.data.user._id,
            referral_code: data.data.user.referralCode,
            referred_by: data.data.user.referredBy || null,
            referral_count: data.data.user.referralCount || data.data.referral?.referredUsers || 0,
            referral_points: data.data.referral?.points || 0,
            is_premium: data.data.user.isPremium || false,
            rewards_claimed: data.data.user.rewardsClaimed || [],
          });
        }
      } else {
        setProfile({
          id: user.id,
          referral_code: 'DEMO123',
          referred_by: null,
          referral_count: 2,
          referral_points: 2,
          is_premium: false,
          rewards_claimed: [],
        });
      }
    } catch (error) {
      console.error('Failed to load referral data:', error);
      setProfile({
        id: user.id,
        referral_code: 'DEMO123',
        referred_by: null,
        referral_count: 2,
        referral_points: 2,
        is_premium: false,
        rewards_claimed: [],
      });
    }
    setLoading(false);
  }

  const referralLink = profile
    ? `${window.location.origin}?ref=${profile.referral_code}`
    : 'https://vpreme.com/ref/YOUR_CODE';

  const referralCount = profile?.referral_count || 0;
  const referralPoints = profile?.referral_points || 0;
  const isPremium = profile?.is_premium || false;
  const rewardsClaimed = profile?.rewards_claimed || [];
  const targetReferrals = 3;

  function copyToClipboard() {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  function shareOnSocial(platform: string) {
    const text = 'Check out VPREME - Never overpay on Amazon again!';
    const url = referralLink;

    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'email':
        window.location.href = `mailto:?subject=${encodeURIComponent('Check out VPREME')}&body=${encodeURIComponent(`${text}\n\n${url}`)}`;
        break;
    }
  }

  async function handleClaimReward(tier: 3 | 5 | 10, rewardType: 'extended_trial' | 'premium_discount' | 'premium_upgrade') {
    if (!user || !profile) return;

    setClaiming(tier);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/referrals/claim-reward`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('vpreme_token')}`,
        },
        body: JSON.stringify({ tier, rewardType }),
      });

      if (response.ok) {
        await loadProfile();
        alert('Reward claimed successfully!');
      } else {
        alert('Unable to claim reward. Make sure you have enough points and haven\'t claimed this reward before.');
      }
    } catch (error) {
      console.error('Failed to claim reward:', error);
      alert('Failed to claim reward. Please try again.');
    }

    setClaiming(null);
  }

  const progress = Math.min((referralCount / targetReferrals) * 100, 100);


  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">Invite Friends, Earn Rewards</h1>
          <p className="text-xl text-gray-300">
            Share VPREME with friends and unlock exclusive perks
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 text-center">
            <Users size={32} className="mx-auto text-white mb-2" />
            <div className="text-3xl font-bold text-white">{referralCount}</div>
            <div className="text-sm text-gray-400">Total Referrals</div>
          </div>
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 text-center">
            <Award size={32} className="mx-auto text-white mb-2" />
            <div className="text-3xl font-bold text-white">{referralPoints}</div>
            <div className="text-sm text-gray-400">Reward Points</div>
          </div>
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 text-center">
            <Gift size={32} className="mx-auto text-white mb-2" />
            <div className="text-3xl font-bold text-white">{isPremium ? '2x' : '1x'}</div>
            <div className="text-sm text-gray-400">Points Multiplier</div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-2xl shadow-md p-8 mb-8 border border-gray-800">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Your Referral Link</h2>

          <div className="flex gap-2 mb-6">
            <input
              type="text"
              value={referralLink}
              readOnly
              className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-700 bg-gray-800 text-white"
            />
            <button
              onClick={copyToClipboard}
              className="bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-all duration-300 flex items-center gap-2"
            >
              {copied ? <Check size={20} /> : <Copy size={20} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => shareOnSocial('facebook')}
              className="bg-gray-700 text-white p-3 rounded-xl hover:bg-gray-600 transition-colors border border-gray-600"
              title="Share on Facebook"
            >
              <Facebook size={24} />
            </button>
            <button
              onClick={() => shareOnSocial('twitter')}
              className="bg-gray-700 text-white p-3 rounded-xl hover:bg-gray-600 transition-colors border border-gray-600"
              title="Share on Twitter"
            >
              <Twitter size={24} />
            </button>
            <button
              onClick={() => shareOnSocial('email')}
              className="bg-gray-600 text-white p-3 rounded-xl hover:bg-gray-700 transition-colors"
              title="Share via Email"
            >
              <Mail size={24} />
            </button>
          </div>

          {profile && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400">
                Your referral code: <span className="font-mono text-white font-bold">{profile.referral_code}</span>
              </p>
            </div>
          )}
        </div>

        <div className="bg-gray-900 rounded-2xl shadow-md p-8 mb-8 border border-gray-800">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Your Progress</h2>

          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-300 mb-2">
              <span>{referralCount} referrals</span>
              <span>{targetReferrals} referrals to unlock perks</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
              <div
                className="bg-white h-full transition-all duration-500 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <p className="text-center text-gray-300 mt-6">
            {referralCount >= targetReferrals
              ? '🎉 You\'ve reached the first milestone!'
              : `Invite ${targetReferrals - referralCount} more friend${targetReferrals - referralCount === 1 ? '' : 's'} to unlock rewards`
            }
          </p>
        </div>

        <div className="bg-gray-900 rounded-2xl shadow-md p-8 mb-8 border border-gray-800">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Rewards</h2>
          <div className="space-y-4">
            <div className={`flex items-center gap-4 p-4 rounded-xl border ${rewardsClaimed.includes('3')
                ? 'bg-green-900/20 border-green-700'
                : 'bg-gray-800 border-gray-700'
              }`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl ${rewardsClaimed.includes('3') ? 'bg-green-600 text-white' : 'bg-white text-black'
                }`}>
                3
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white">3 Points — Extended Free Trial</h3>
                <p className="text-sm text-gray-300">Get 1 month of Premium features — free!</p>
              </div>
              {rewardsClaimed.includes('3') ? (
                <div className="text-green-400 font-bold">✓ Claimed</div>
              ) : referralPoints >= 3 ? (
                <button
                  onClick={() => handleClaimReward(3, 'extended_trial')}
                  disabled={claiming === 3}
                  className="bg-white text-black px-4 py-2 rounded-lg font-bold hover:bg-gray-100 transition-colors disabled:bg-gray-600"
                >
                  {claiming === 3 ? 'Claiming...' : 'Claim'}
                </button>
              ) : (
                <div className="text-gray-500">Locked</div>
              )}
            </div>

            <div className={`flex items-center gap-4 p-4 rounded-xl border ${rewardsClaimed.includes('5')
                ? 'bg-green-900/20 border-green-700'
                : 'bg-gray-800 border-gray-700'
              }`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl ${rewardsClaimed.includes('5') ? 'bg-green-600 text-white' : 'bg-white text-black'
                }`}>
                5
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white">5 Points — Premium Starter Discount</h3>
                <p className="text-sm text-gray-300">Enjoy 50% off your first year of Premium.</p>
              </div>
              {rewardsClaimed.includes('5') ? (
                <div className="text-green-400 font-bold">✓ Claimed</div>
              ) : referralPoints >= 5 ? (
                <button
                  onClick={() => handleClaimReward(5, 'premium_discount')}
                  disabled={claiming === 5}
                  className="bg-white text-black px-4 py-2 rounded-lg font-bold hover:bg-gray-100 transition-colors disabled:bg-gray-600"
                >
                  {claiming === 5 ? 'Claiming...' : 'Claim'}
                </button>
              ) : (
                <div className="text-gray-500">Locked</div>
              )}
            </div>

            <div className={`flex items-center gap-4 p-4 rounded-xl border ${rewardsClaimed.includes('10')
                ? 'bg-green-900/20 border-green-700'
                : 'bg-gray-800 border-gray-700'
              }`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl ${rewardsClaimed.includes('10') ? 'bg-green-600 text-white' : 'bg-white text-black'
                }`}>
                10
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white">10 Points — Premium Access Upgrade</h3>
                <p className="text-sm text-gray-300">Unlock 2 years of Premium access — one-time reward.</p>
              </div>
              {rewardsClaimed.includes('10') ? (
                <div className="text-green-400 font-bold">✓ Claimed</div>
              ) : referralPoints >= 10 ? (
                <button
                  onClick={() => handleClaimReward(10, 'premium_upgrade')}
                  disabled={claiming === 10}
                  className="bg-white text-black px-4 py-2 rounded-lg font-bold hover:bg-gray-100 transition-colors disabled:bg-gray-600"
                >
                  {claiming === 10 ? 'Claiming...' : 'Claim'}
                </button>
              ) : (
                <div className="text-gray-500">Locked</div>
              )}
            </div>
          </div>
        </div>

        {!isPremium && (
          <button
            onClick={() => onNavigate?.('premium')}
            className="w-full bg-gradient-to-r from-white to-gray-300 rounded-2xl p-8 text-black text-center mb-8 hover:from-gray-100 hover:to-gray-400 transition-all duration-300 cursor-pointer"
          >
            <h3 className="text-2xl font-bold mb-4">Premium gives double referral points</h3>
            <p className="text-lg mb-4">
              Upgrade to Premium and earn rewards twice as fast
            </p>
            <div className="bg-black text-white px-8 py-3 rounded-xl font-bold inline-block">
              Upgrade to Premium
            </div>
          </button>
        )}

        <div className="bg-gray-900 rounded-2xl shadow-sm p-6 text-center border border-gray-800">
          <p className="text-sm text-gray-400">
            As an affiliate, we may earn a small commission from qualifying purchases at no extra cost to you.
          </p>
        </div>
      </div>
    </div>
  );
}
