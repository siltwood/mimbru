import React, { useEffect, useRef, useState } from 'react';
import { View, Dimensions, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { Image } from 'expo-image';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

type AnimationState = 'idle' | 'walking_up' | 'walking_down' | 'walking_left' | 'walking_right' | 'happy' | 'sad' | 'eating' | 'sleeping' | 'dead';

interface AnimationConfig {
  frames: any[]; // Array of image sources (walking1, walking2, etc.)
  frameRate: number; // FPS
  loop: boolean; // Whether to loop the animation
}

interface SpritePetProps {
  animationState: AnimationState;
  animations: Partial<Record<AnimationState, AnimationConfig>>;
  scale?: number;
  bounds?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export function SpritePet({ 
  animationState, 
  animations, 
  scale = 2,
  bounds = { x: 50, y: 100, width: screenWidth - 100, height: screenHeight - 300 }
}: SpritePetProps) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isMoving, setIsMoving] = useState(false);
  const [currentDirection, setCurrentDirection] = useState<'up' | 'down' | 'left' | 'right'>('down');
  
  // Position values
  const positionX = useSharedValue(bounds.width / 2);
  const positionY = useSharedValue(bounds.height / 2);
  
  // Get current animation configuration
  const currentAnimation = animations[animationState];
  
  // Debug logging
  useEffect(() => {
    console.log('Current animation state:', animationState);
    console.log('Available animations:', Object.keys(animations));
    console.log('Current animation:', currentAnimation);
  }, [animationState, currentAnimation]);
  
  // Frame animation
  useEffect(() => {
    if (!currentAnimation || currentAnimation.frames.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentFrame(prev => {
        if (currentAnimation.loop) {
          return (prev + 1) % currentAnimation.frames.length;
        } else {
          return Math.min(prev + 1, currentAnimation.frames.length - 1);
        }
      });
    }, 1000 / currentAnimation.frameRate);
    
    return () => clearInterval(interval);
  }, [currentAnimation, animationState]);
  
  // Reset frame when animation changes
  useEffect(() => {
    setCurrentFrame(0);
  }, [animationState]);
  
  // Random movement with direction detection and proper bounds
  useEffect(() => {
    if (animationState === 'sleeping' || animationState === 'dead') return;
    
    const moveRandomly = () => {
      const currentX = positionX.value;
      const currentY = positionY.value;
      
      // Calculate sprite size to ensure it stays within bounds
      const spriteSize = 32 * scale;
      const padding = 8; // Extra padding from walls
      
      // Calculate safe movement area (excluding sprite size and padding)
      const safeWidth = bounds.width - spriteSize - (padding * 2);
      const safeHeight = bounds.height - spriteSize - (padding * 2);
      
      // Ensure minimum safe area
      const minSafeArea = spriteSize + padding;
      if (safeWidth < minSafeArea || safeHeight < minSafeArea) {
        console.log('Bounds too small for safe movement');
        return;
      }
      
      // Generate new position within safe bounds
      const newX = padding + (Math.random() * safeWidth);
      const newY = padding + (Math.random() * safeHeight);
      
      // Determine direction based on movement
      const deltaX = newX - currentX;
      const deltaY = newY - currentY;
      
      let direction: 'up' | 'down' | 'left' | 'right';
      
      // Use random vs straight movement decision
      const useRandomMovement = Math.random() < 0.5; // 50% random, 50% straight
      
      if (useRandomMovement) {
        // Random diagonal movement
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          direction = deltaX > 0 ? 'right' : 'left';
        } else {
          direction = deltaY > 0 ? 'down' : 'up';
        }
      } else {
        // Straight line movement - pick a random cardinal direction
        const directions: ('up' | 'down' | 'left' | 'right')[] = ['up', 'down', 'left', 'right'];
        direction = directions[Math.floor(Math.random() * directions.length)];
      }
      
      runOnJS(setCurrentDirection)(direction);
      runOnJS(setIsMoving)(true);
      
      // Calculate movement duration based on distance
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const baseDuration = 2000; // Base 2 seconds
      const duration = Math.max(baseDuration, distance * 10); // Scale with distance
      
      positionX.value = withTiming(newX, {
        duration: duration,
        easing: Easing.inOut(Easing.quad),
      });
      positionY.value = withTiming(newY, {
        duration: duration,
        easing: Easing.inOut(Easing.quad),
      }, () => {
        runOnJS(setIsMoving)(false);
      });
    };
    
    // Move every 4-12 seconds for more engaging movement
    const randomInterval = 4000 + Math.random() * 8000;
    const timeout = setTimeout(moveRandomly, randomInterval);
    
    return () => clearTimeout(timeout);
  }, [isMoving, animationState, bounds]);
  
  // Determine which animation to use based on state and movement
  const getEffectiveAnimationState = (): AnimationState => {
    if (animationState === 'dead' || animationState === 'sleeping' || animationState === 'eating' || animationState === 'happy' || animationState === 'sad') {
      // Check if we have the specific animation, otherwise fall back to idle/walking
      if (animations[animationState]) {
        return animationState;
      }
      // Fall back to movement-based animations if we don't have the specific emotional state
    }
    
    if (isMoving) {
      return `walking_${currentDirection}` as AnimationState;
    }
    
    // Fall back to any available walking animation if no idle animation
    if (!animations['idle'] && animations['walking_down']) {
      return 'walking_down';
    }
    
    return 'idle';
  };
  
  const effectiveAnimationState = getEffectiveAnimationState();
  const effectiveAnimation = animations[effectiveAnimationState];
  
  // Animated style for position
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: positionX.value },
      { translateY: positionY.value },
    ],
  }));
  
  if (!effectiveAnimation || effectiveAnimation.frames.length === 0) {
    // Fallback: show text label above a basic pet shape
    const stateText = effectiveAnimationState.toUpperCase().replace('_', ' ');
    
    return (
      <Animated.View
        style={[
          {
            position: 'absolute',
            left: bounds.x,
            top: bounds.y,
            alignItems: 'center',
          },
          animatedStyle,
        ]}
      >
        {/* Text label above pet */}
        <View style={{
          backgroundColor: 'rgba(0,0,0,0.7)',
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 4,
          marginBottom: 4,
        }}>
          <Text style={{
            color: 'white',
            fontSize: 10,
            fontWeight: 'bold',
          }}>
            {stateText}
          </Text>
        </View>
        
        {/* Simple pet body */}
        <View style={{
          width: 32 * scale,
          height: 32 * scale,
          backgroundColor: '#F5A623',
          borderRadius: 16 * scale,
          borderWidth: 2,
          borderColor: '#333',
        }} />
      </Animated.View>
    );
  }
  
  const currentFrameSource = effectiveAnimation.frames[currentFrame % effectiveAnimation.frames.length];
  
  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: bounds.x,
          top: bounds.y,
        },
        animatedStyle,
      ]}
    >
      <Image
        source={currentFrameSource}
        style={{
          width: 32 * scale, // You can adjust this based on your sprite size
          height: 32 * scale,
        }}
        contentFit="contain"
      />
    </Animated.View>
  );
}

// Helper function to create animation config
export function createAnimation(
  frames: any[],
  frameRate: number = 8,
  loop: boolean = true
): AnimationConfig {
  return {
    frames,
    frameRate,
    loop,
  };
} 