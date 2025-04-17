import React, { useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import { Users, Check } from 'lucide-react';
import { DishItem, User } from '../types';

interface Props {
  item: DishItem;
  currentUserId: string;
  onClick: () => void;
  onSplit: () => void;
  price: number;
  assignedTo: string[];
  allUsers: User[];
}

const SwipableDish: React.FC<Props> = ({
  item,
  currentUserId,
  onClick,
  onSplit,
  price,
  assignedTo,
  allUsers,
}) => {
  const [offsetX, setOffsetX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

  const MAX_SWIPE = -140;
  const TRIGGER_SWIPE = MAX_SWIPE / 2;

  const isOwner = assignedTo.length === 0 || assignedTo[0] === currentUserId;
  const isSelected = assignedTo.includes(currentUserId);

  const swipeHandlers = useSwipeable({
    onSwiping: (e) => {
      if (e.deltaX < 0 && isOwner) {
        setIsSwiping(true);
        setOffsetX(Math.max(e.deltaX, MAX_SWIPE));
      }
    },
    onSwipedLeft: () => {
      if (isOwner && offsetX <= TRIGGER_SWIPE) onSplit();
      setOffsetX(0);
      setIsSwiping(false);
    },
    onSwipedRight: () => {
      setOffsetX(0);
      setIsSwiping(false);
    },
    trackTouch: true,
    preventScrollOnSwipe: true,
  });

  const renderAvatars = () => {
    const visible = assignedTo.slice(0, 3);
    const extra = assignedTo.length - visible.length;

    const getUser = (id: string) => allUsers.find((u) => u.id === id);

    return (
      <div className="flex -space-x-2">
        {visible.map((id) => {
          const user = getUser(id);
          if (!user) return null;

          return (
            <div
              key={id}
              className="w-6 h-6 rounded-full border-2 border-white shadow-sm bg-gray-200 overflow-hidden"
              title={user.name}
            >
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-[10px] text-center text-white bg-gray-500 w-full h-full flex items-center justify-center font-semibold">
                  {user.name[0]}
                </span>
              )}
            </div>
          );
        })}
        {extra > 0 && (
          <div className="w-6 h-6 rounded-full bg-gray-200 text-xs flex items-center justify-center border-2 border-white text-gray-600">
            +{extra}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Swipe background */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-600 via-green-500 to-purple-400 flex justify-end items-center pr-1">
        <div className="flex items-center gap-1 text-white font-medium">
          <Users size={16} />
          Разделить блюдо
        </div>
      </div>

      {/* Main swipeable card */}
      <div
        {...swipeHandlers}
        onClick={onClick}
        style={{
          transform: `translateX(${offsetX}px)`,
          transition: isSwiping ? 'none' : 'transform 300ms ease-out',
        }}
        className={`relative z-10 p-4 rounded-xl cursor-pointer border shadow-sm transition-all ${
          isSelected
            ? 'bg-green-50 border-green-400 scale-[1.01]'
            : 'bg-white hover:bg-gray-50 hover:shadow-md'
        }`}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            {isSelected && (
              <div className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center">
                <Check size={14} />
              </div>
            )}
            <div>
              <span className="font-medium">{item.name}</span>
              {/* {assignedTo.length > 1 && (
                <span className="ml-1 text-sm text-gray-500">
                  (Поделили на {assignedTo.length})
                </span>
              )} */}
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>{(price / (assignedTo.length || 1)).toFixed(2)} ₽</span>
            {assignedTo.length > 0 && renderAvatars()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SwipableDish;
