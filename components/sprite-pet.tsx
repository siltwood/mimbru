import React, { useEffect, useState } from 'react';
import { View, Dimensions, Text, ImageSourcePropType } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { Image } from 'expo-image';
import { AnimationState } from '@/lib/types/creature';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface AnimationConfig {
  frames: ImageSourcePropType[];
  frameRate: number;
  loop: boolean;
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
  forceMove?: 'up' | 'down' | 'left' | 'right' | 'center' | null;
}

export function SpritePet({
  animationState,
  animations,
  scale = 2,
  bounds = { x: 50, y: 100, width: screenWidth - 100, height: screenHeight - 300 },
  forceMove = null,
}: SpritePetProps) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isMoving, setIsMoving] = useState(false);
  const [currentDirection, setCurrentDirection] = useState<'up' | 'down' | 'left' | 'right'>('down');

  const positionX = useSharedValue(bounds.width / 2);
  const positionY = useSharedValue(bounds.height / 2);

  // Determine which animation to use based on state and movement
  const getEffectiveAnimationState = (): AnimationState => {
    if (animationState === 'dead') {
      return animations['walking_down'] ? 'walking_down' : 'idle';
    }

    if (animationState === 'sleeping' || animationState === 'eating' || animationState === 'happy' || animationState === 'sad') {
      if (animations[animationState]) {
        return animationState;
      }
    }

    if (isMoving) {
      return `walking_${currentDirection}` as AnimationState;
    }

    // When idle, use walking_down as default (first frame will show)
    if (!animations['idle'] && animations['walking_down']) {
      return 'walking_down';
    }

    return 'idle';
  };

  const effectiveAnimationState = getEffectiveAnimationState();
  const effectiveAnimation = animations[effectiveAnimationState];

  // Frame animation - uses effectiveAnimation so it works when moving
  useEffect(() => {
    if (!effectiveAnimation || effectiveAnimation.frames.length === 0) return;

    // Don't animate frames when dead or idle - stay on first frame
    if (animationState === 'dead' || !isMoving) {
      setCurrentFrame(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentFrame(prev => {
        if (effectiveAnimation.loop) {
          return (prev + 1) % effectiveAnimation.frames.length;
        } else {
          return Math.min(prev + 1, effectiveAnimation.frames.length - 1);
        }
      });
    }, 1000 / effectiveAnimation.frameRate);

    return () => clearInterval(interval);
  }, [effectiveAnimation, animationState, isMoving]);

  // Reset frame when direction changes
  useEffect(() => {
    setCurrentFrame(0);
  }, [currentDirection]);

  // Force move in a specific direction (for testing)
  useEffect(() => {
    if (!forceMove) return;

    const currentX = positionX.value;
    const currentY = positionY.value;
    const spriteSize = 32 * scale;
    const padding = 8;
    const safeWidth = bounds.width - spriteSize - (padding * 2);
    const safeHeight = bounds.height - spriteSize - (padding * 2);

    let newX = currentX;
    let newY = currentY;
    const moveDistance = 80; // Fixed distance for test

    // Pick a target that's predominantly in the forced direction
    switch (forceMove) {
      case 'center':
        newX = safeWidth / 2;
        newY = safeHeight / 2;
        break;
      case 'left':
        newX = Math.max(padding, currentX - moveDistance);
        newY = currentY + (Math.random() - 0.5) * 20;
        break;
      case 'right':
        newX = Math.min(padding + safeWidth, currentX + moveDistance);
        newY = currentY + (Math.random() - 0.5) * 20;
        break;
      case 'up':
        newX = currentX + (Math.random() - 0.5) * 20;
        newY = Math.max(padding, currentY - moveDistance);
        break;
      case 'down':
        newX = currentX + (Math.random() - 0.5) * 20;
        newY = Math.min(padding + safeHeight, currentY + moveDistance);
        break;
    }

    if (forceMove !== 'center') {
      setCurrentDirection(forceMove);
    }
    setIsMoving(true);

    positionX.value = withTiming(newX, { duration: 800, easing: Easing.inOut(Easing.quad) });
    positionY.value = withTiming(newY, { duration: 800, easing: Easing.inOut(Easing.quad) }, () => {
      runOnJS(setIsMoving)(false);
    });
  }, [forceMove]);

  // Random movement (only when not force moving)
  useEffect(() => {
    if (animationState === 'sleeping' || animationState === 'dead' || forceMove) return;

    const moveRandomly = () => {
      const currentX = positionX.value;
      const currentY = positionY.value;

      const spriteSize = 32 * scale;
      const padding = 8;

      const safeWidth = bounds.width - spriteSize - (padding * 2);
      const safeHeight = bounds.height - spriteSize - (padding * 2);

      const minSafeArea = spriteSize + padding;
      if (safeWidth < minSafeArea || safeHeight < minSafeArea) {
        return;
      }

      const newX = padding + (Math.random() * safeWidth);
      const newY = padding + (Math.random() * safeHeight);

      const deltaX = newX - currentX;
      const deltaY = newY - currentY;

      let direction: 'up' | 'down' | 'left' | 'right';

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        direction = deltaX > 0 ? 'right' : 'left';
      } else {
        direction = deltaY > 0 ? 'down' : 'up';
      }

      runOnJS(setCurrentDirection)(direction);
      runOnJS(setIsMoving)(true);

      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const duration = Math.max(2000, distance * 10);

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

    const randomInterval = 4000 + Math.random() * 8000;
    const timeout = setTimeout(moveRandomly, randomInterval);

    return () => clearTimeout(timeout);
  }, [isMoving, animationState, bounds, forceMove]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: positionX.value },
      { translateY: positionY.value },
      { rotate: animationState === 'dead' ? '90deg' : '0deg' },
    ],
  }));

  if (!effectiveAnimation || effectiveAnimation.frames.length === 0) {
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
          width: 32 * scale,
          height: 32 * scale,
        }}
        contentFit="contain"
      />
    </Animated.View>
  );
}

export function createAnimation(
  frames: ImageSourcePropType[],
  frameRate: number = 8,
  loop: boolean = true
): AnimationConfig {
  return { frames, frameRate, loop };
}
