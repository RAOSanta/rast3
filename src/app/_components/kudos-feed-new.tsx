"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { api } from "~/trpc/react";
import { formatDistanceToNow } from "date-fns";
import { useSession } from "next-auth/react";
import { getProxyImageUrl, handleImageError } from "~/utils/image-utils";

interface KudosFeedProps {
  className?: string;
}

interface ImageCarouselProps {
  images: string[];
}

type ScopeType = "department" | "domain" | "site";

// Christmas-themed names for anonymization
const CHRISTMAS_NAMES = [
  "Jingle Bell", "Holly Berry", "Candy Cane", "Snow Flake", "Winter Star",
  "Frost Bite", "Pine Needle", "Sugar Plum", "Ginger Bread", "Icicle Drop",
  "Mistletoe", "Nutcracker", "Tinsel Shine", "Cocoa Bean", "Peppermint",
  "Sleigh Bell", "Reindeer", "Snowball", "Eggnog", "Christmas Tree",
  "Angel Wing", "Star Light", "Gift Wrap", "Ribbon Bow", "Ornament",
  "Candy Mint", "Hot Cocoa", "Fire Place", "Wreath Maker", "Cookie Baker",
  "Snow Angel", "Ice Crystal", "Winter Moon", "Frost King", "Snow Queen",
  "Jingle Jangle", "Merry Maker", "Joy Bringer", "Hope Bearer", "Peace Keeper",
  "Love Giver", "Kind Heart", "Gentle Soul", "Warm Hug", "Sweet Smile",
  "Bright Light", "Happy Helper", "Cheerful Elf", "Magic Maker", "Wonder Worker"
];

// Christmas-themed emojis for avatars
const CHRISTMAS_AVATARS = [
  "🎅", "🤶", "🎄", "⭐", "❄️", "🎁", "🔔", "🕯️", "🍪", "🥛",
  "🦌", "⛄", "🎊", "🎉", "✨", "🌟", "🎀", "🧑‍🎄", "🎯", "🎪",
  "🍭", "🧤", "🧣", "👑", "💎", "🎭", "🎨", "🎵", "🎶", "💫"
];

// Christmas-themed colors for user backgrounds - more vibrant for full cards
const CHRISTMAS_COLORS = [
  "bg-red-200", "bg-green-200", "bg-red-300", "bg-green-300", 
  "bg-emerald-200", "bg-rose-200", "bg-lime-200", "bg-pink-200",
  "bg-teal-200", "bg-amber-200", "bg-orange-200", "bg-yellow-200",
  "bg-indigo-200", "bg-purple-200", "bg-cyan-200", "bg-slate-200"
];

// Function to generate consistent Christmas name, avatar, and color based on user ID
const getChristmasIdentity = (userId: string) => {
  // Create a simple hash from the user ID for consistency
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  const nameIndex = Math.abs(hash) % CHRISTMAS_NAMES.length;
  const avatarIndex = Math.abs(hash >> 8) % CHRISTMAS_AVATARS.length;
  const colorIndex = Math.abs(hash >> 16) % CHRISTMAS_COLORS.length;
  
  return {
    name: CHRISTMAS_NAMES[nameIndex]!,
    avatar: CHRISTMAS_AVATARS[avatarIndex]!,
    color: CHRISTMAS_COLORS[colorIndex]!
  };
};

// Image Carousel Component with expand/collapse functionality
const ImageCarousel: React.FC<ImageCarouselProps> = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };
  
  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleImageClick = () => {
    setIsExpanded(!isExpanded);
  };

  if (images.length === 0) return null;

  if (images.length === 1) {
    return (
      <div className={`relative w-full transition-all duration-300 ${isExpanded ? 'aspect-auto' : 'aspect-square'}`}>
        <Image
          src={getProxyImageUrl(images[0]!)}
          alt="Kudos image"
          fill
          className={`cursor-pointer shadow-sm hover:shadow-md transition-shadow rounded-lg ${
            isExpanded ? 'object-contain' : 'object-cover'
          }`}
          onClick={handleImageClick}
          onError={handleImageError}
          sizes="(max-width: 768px) 50vw, 33vw"
        />
        {/* Expand/collapse indicator overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black bg-opacity-20 rounded-lg">
          <div className="bg-white bg-opacity-90 rounded-full p-2">
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d={isExpanded ? "M6 18L18 6M6 6l12 12" : "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"} />
            </svg>
          </div>
        </div>
        {/* Click hint text */}
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity">
          {isExpanded ? 'Click to collapse' : 'Click to expand'}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full transition-all duration-300 ${isExpanded ? 'aspect-auto' : 'aspect-square'}`}>
      <Image
        src={getProxyImageUrl(images[currentIndex]!)}
        alt={`Image ${currentIndex + 1} of ${images.length}`}
        fill
        className={`cursor-pointer shadow-sm hover:shadow-md transition-shadow rounded-lg ${
          isExpanded ? 'object-contain' : 'object-cover'
        }`}
        onClick={handleImageClick}
        onError={handleImageError}
        sizes="(max-width: 768px) 50vw, 33vw"
      />
      
      {/* Navigation dots */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex(index);
            }}
            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-colors ${
              index === currentIndex ? 'bg-white' : 'bg-white bg-opacity-50'
            }`}
          />
        ))}
      </div>

      {/* Swipe overlay for mobile - with visual indicators */}
      <div className="absolute inset-0 flex">
        <div 
          className="w-1/3 h-full cursor-pointer group flex items-center justify-start pl-2"
          onClick={(e) => {
            e.stopPropagation();
            handlePrev();
          }}
        >
          <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-50 rounded-full p-1">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </div>
        </div>
        <div 
          className="w-1/3 h-full cursor-pointer group flex items-center justify-center"
          onClick={handleImageClick}
        >
          {/* Expand/collapse indicator overlay */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-50 rounded-full p-2">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d={isExpanded ? "M6 18L18 6M6 6l12 12" : "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"} />
            </svg>
          </div>
        </div>
        <div 
          className="w-1/3 h-full cursor-pointer group flex items-center justify-end pr-2"
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
        >
          <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-50 rounded-full p-1">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Image counter */}
      <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-1 rounded z-10">
        {currentIndex + 1}/{images.length}
      </div>
      
      {/* Click hint text */}
      <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity z-10">
        {isExpanded ? 'Click center to collapse' : 'Click center to expand'}
      </div>
    </div>
  );
};

export const KudosFeed: React.FC<KudosFeedProps> = ({ className = "" }) => {
  const { data: session } = useSession();
  const [selectedScope, setSelectedScope] = useState<ScopeType | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Get recommended scope
  const { data: recommendedScope } = api.kudos.getRecommendedScope.useQuery();
  
  // Use recommended scope if no scope is selected
  const currentScope = selectedScope ?? recommendedScope ?? "site";

  // Fetch feed data with infinite query for pagination
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = api.kudos.getFeed.useInfiniteQuery(
    {
      scope: currentScope,
      limit: 10,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      enabled: !!currentScope,
    }
  );

  const allKudos = data?.pages.flatMap((page) => page.items) ?? [];

  // Intersection Observer for automatic loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      {
        threshold: 0.1,
        rootMargin: "100px",
      }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const getScopeDisplayName = (scope: ScopeType) => {
    switch (scope) {
      case "department":
        return "Department";
      case "domain":
        return "Domain";
      case "site":
        return "Site";
      default:
        return scope;
    }
  };

  const getScopeDescription = (scope: ScopeType) => {
    switch (scope) {
      case "department":
        return "See kudos from your department colleagues";
      case "domain":
        return "See kudos from your domain";
      case "site":
        return "See all kudos from the entire site";
      default:
        return "";
    }
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="border-b pb-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                  <div className="space-y-1">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="text-center text-red-600">
          <p>Failed to load kudos feed</p>
          <p className="text-sm text-gray-500">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md ${className}`}>
      {/* Header with scope selection */}
      <div className="p-6 border-b">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Kudos Feed</h2>
        
        {/* Scope Selection Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {(["department", "domain", "site"] as ScopeType[])
            .filter((scope) => {
              // For unauthenticated users, only show site scope
              if (!session) {
                return scope === "site";
              }
              // For authenticated users, show all scopes
              return true;
            })
            .map((scope) => (
              <button
                key={scope}
                onClick={() => setSelectedScope(scope)}
                className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                  currentScope === scope
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                title={getScopeDescription(scope)}
              >
                {getScopeDisplayName(scope)}
              </button>
            ))}
        </div>
        
        {session && recommendedScope && !selectedScope && (
          <p className="text-sm text-gray-500 mt-2">
            Showing {getScopeDisplayName(recommendedScope).toLowerCase()} feed by default
          </p>
        )}
        
        {!session && (
          <p className="text-sm text-gray-500 mt-2">
            Showing all kudos. Sign in to see department and domain-specific feeds.
          </p>
        )}
      </div>
      
      {/* Feed Content */}
      <div>
        {allKudos.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-lg font-medium">No kudos yet</p>
            <p className="text-sm">Be the first to share some appreciation!</p>
          </div>
        ) : (
          <div className="p-6">
            {/* Masonry Grid Container */}
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
              {allKudos.map((kudos) => {
                const images = kudos.images ? JSON.parse(kudos.images) as string[] : [];
                
                // Get Christmas-themed anonymous identity
                const christmasIdentity = getChristmasIdentity(kudos.user.id);
                const displayName = christmasIdentity.name;
                const avatarEmoji = christmasIdentity.avatar;

                return (
                  <div key={kudos.id} className="break-inside-avoid mb-6">
                    <div className={`${christmasIdentity.color} rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-white border-opacity-50 overflow-hidden`}>
                      {/* Purchase context */}
                      {kudos.purchase && (
                        <div className="m-4 mb-3 p-3 bg-white bg-opacity-50 rounded-lg border-l-4 border-red-400">
                          <p className="text-sm text-red-800">
                            🎁 Thanking{" "}
                            <span className="font-medium">
                              {getChristmasIdentity(kudos.purchase.wishlistAssignment.wishlistOwner.id).name}
                            </span>{" "}
                            for a gift
                          </p>
                        </div>
                      )}

                      {/* Images at the top */}
                      {images.length > 0 && (
                        <div className="w-full">
                          <div className="aspect-square">
                            <ImageCarousel images={images} />
                          </div>
                        </div>
                      )}

                      {/* Content below image */}
                      <div className="p-5">
                        {/* User info */}
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="flex-shrink-0">
                            <div className="h-12 w-12 rounded-full bg-white shadow-sm flex items-center justify-center border-2 border-white border-opacity-70">
                              <span className="text-2xl">
                                {avatarEmoji}
                              </span>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 flex-wrap">
                              <p className="text-lg font-semibold text-gray-900">{displayName}</p>
                            </div>
                            <p className="text-sm text-gray-700 opacity-80">
                              {formatDistanceToNow(new Date(kudos.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                        </div>

                        {/* Message */}
                        <div className="bg-white bg-opacity-40 rounded-xl p-4 shadow-sm border border-white border-opacity-30">
                          <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{kudos.message}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Intersection Observer Target & Loading Indicator */}
        {hasNextPage && (
          <div 
            ref={loadMoreRef}
            className="p-4 text-center"
          >
            {isFetchingNextPage ? (
              <div className="flex items-center justify-center space-x-2 text-gray-500">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
                <span className="text-sm">Loading more kudos...</span>
              </div>
            ) : (
              <button
                onClick={() => fetchNextPage()}
                className="text-sm text-blue-600 hover:text-blue-700 py-2 px-4 rounded-md hover:bg-blue-50 transition-colors"
              >
                Load more kudos
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default KudosFeed;
