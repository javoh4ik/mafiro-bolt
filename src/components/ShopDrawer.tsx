import React, { useState } from 'react';
import { ShopItem, UserProfile } from '../types/game';
import { X, Star, DollarSign, Check, ShieldCheck, Sparkles } from 'lucide-react';

interface ShopDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: ShopItem[];
  user: UserProfile;
  onBuyItem: (itemId: string, currency: 'stars' | 'bucks') => void;
  onRequestInvoice: (itemId: string) => void;
}

export const ShopDrawer: React.FC<ShopDrawerProps> = ({
  isOpen,
  onClose,
  items,
  user,
  onBuyItem,
  onRequestInvoice
}) => {
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePurchase = (itemId: string, currency: 'stars' | 'bucks') => {
    if (currency === 'stars') {
      onRequestInvoice(itemId);
    } else {
      onBuyItem(itemId, 'bucks');
      setSuccessMsg('Предмет добавлен в инвентарь!');
      setTimeout(() => setSuccessMsg(null), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-[430px] rounded-t-3xl sm:rounded-3xl bg-[#0A0E17] border border-[#FF2A55]/30 shadow-luxury p-5 flex flex-col gap-4 text-white max-h-[90dvh] overflow-y-auto no-scrollbar">
        
        {/* Header */}
        <div className="w-full flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">⭐</span>
            <div>
              <h3 className="font-serif font-bold text-base tracking-wider uppercase text-[#FF8FA5]">
                Подпольный Арсенал
              </h3>
              <p className="text-[10px] text-gray-400">Telegram Stars & Syndicate Bucks</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Balance Strip */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-[#0F1522] border border-white/5 font-mono text-xs">
          <div className="flex items-center gap-1.5 text-amber-300 font-bold">
            <Star className="w-4 h-4 fill-[#FF2A55] text-[#FF2A55]" />
            <span>Баланс: {user.stars} ⭐</span>
          </div>
          <div className="flex items-center gap-1 text-emerald-400 font-bold">
            <DollarSign className="w-4 h-4" />
            <span>{user.bucks} $</span>
          </div>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs text-center font-medium flex items-center justify-center gap-1.5">
            <Check className="w-4 h-4" /> {successMsg}
          </div>
        )}

        {/* Items List */}
        <div className="flex flex-col gap-3">
          {items.map((item) => {
            const hasItem = user.inventory?.includes(item.id);

            return (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-[#0F1522] border border-white/10 hover:border-[#FF2A55]/40 flex flex-col gap-2.5 transition-colors shadow-sm"
              >
                {/* Item Info */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-black/50 border border-white/10 flex items-center justify-center text-2xl shadow-inner">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-xs text-white">
                        {item.title}
                      </h4>
                      <span className="text-[10px] text-[#FF2A55] font-semibold">
                        {item.subtitle}
                      </span>
                    </div>
                  </div>

                  {hasItem && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/50 text-emerald-300 font-mono text-[9px] font-bold">
                      <ShieldCheck className="w-3 h-3" /> В наличии
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="text-[11px] text-gray-300 leading-snug">
                  {item.description}
                </p>

                {/* Purchase Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/5">
                  {/* Buy with Telegram Stars */}
                  <button
                    type="button"
                    onClick={() => handlePurchase(item.id, 'stars')}
                    className="py-1.5 px-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-serif font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                  >
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{item.stars_price} ⭐ Stars</span>
                  </button>

                  {/* Buy with Bucks */}
                  <button
                    type="button"
                    onClick={() => handlePurchase(item.id, 'bucks')}
                    disabled={user.bucks < item.bucks_price}
                    className="py-1.5 px-2 rounded-xl bg-[#1A2233] hover:bg-[#253046] border border-white/10 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center gap-1 active:scale-95 transition-all disabled:opacity-40"
                  >
                    <DollarSign className="w-3 h-3" />
                    <span>{item.bucks_price} $</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
