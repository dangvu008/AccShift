import React, { useRef, useEffect } from 'react';
import { Animated, Easing } from 'react-native';
import { ANIMATION } from '../styles';

/**
 * 🎬 Enhanced Animation Components for AccShift
 * Modern animation utilities and components with micro-interactions
 * Supports the new enhanced design system with smooth transitions
 */

// === ANIMATION HOOKS ===

/**
 * Fade In Animation Hook
 * @param {number} duration - Animation duration in ms
 * @param {number} delay - Animation delay in ms
 * @param {number} toValue - Target opacity value
 */
export const useFadeIn = (duration = ANIMATION.DURATION.MEDIUM, delay = 0, toValue = 1) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue,
        duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [fadeAnim, duration, delay, toValue]);

  return fadeAnim;
};

/**
 * Scale Animation Hook
 * @param {number} duration - Animation duration in ms
 * @param {number} delay - Animation delay in ms
 * @param {number} fromValue - Initial scale value
 * @param {number} toValue - Target scale value
 */
export const useScale = (duration = ANIMATION.DURATION.MEDIUM, delay = 0, fromValue = 0.8, toValue = 1) => {
  const scaleAnim = useRef(new Animated.Value(fromValue)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(scaleAnim, {
        toValue,
        duration,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [scaleAnim, duration, delay, fromValue, toValue]);

  return scaleAnim;
};

/**
 * Slide Animation Hook
 * @param {number} duration - Animation duration in ms
 * @param {number} delay - Animation delay in ms
 * @param {number} fromValue - Initial position value
 * @param {number} toValue - Target position value
 */
export const useSlide = (duration = ANIMATION.DURATION.MEDIUM, delay = 0, fromValue = 50, toValue = 0) => {
  const slideAnim = useRef(new Animated.Value(fromValue)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(slideAnim, {
        toValue,
        duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [slideAnim, duration, delay, fromValue, toValue]);

  return slideAnim;
};

/**
 * Bounce Animation Hook
 * @param {boolean} trigger - Whether to trigger the animation
 * @param {number} duration - Animation duration in ms
 */
export const useBounce = (trigger = false, duration = ANIMATION.DURATION.SHORT) => {
  const bounceAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (trigger) {
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1.1,
          duration: duration / 2,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: duration / 2,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [trigger, bounceAnim, duration]);

  return bounceAnim;
};

/**
 * Pulse Animation Hook
 * @param {boolean} active - Whether animation is active
 * @param {number} duration - Animation duration in ms
 */
export const usePulse = (active = true, duration = ANIMATION.DURATION.LONG) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (active) {
      const pulse = () => {
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: duration / 2,
            easing: Easing.inOut(Easing.sine),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: duration / 2,
            easing: Easing.inOut(Easing.sine),
            useNativeDriver: true,
          }),
        ]).start(() => {
          if (active) pulse();
        });
      };
      pulse();
    }
  }, [active, pulseAnim, duration]);

  return pulseAnim;
};

// === ANIMATED COMPONENTS ===

/**
 * Fade In View Component
 */
export const FadeInView = ({ 
  children, 
  duration = ANIMATION.DURATION.MEDIUM, 
  delay = 0, 
  style,
  ...props 
}) => {
  const fadeAnim = useFadeIn(duration, delay);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: fadeAnim,
        },
      ]}
      {...props}
    >
      {children}
    </Animated.View>
  );
};

/**
 * Scale In View Component
 */
export const ScaleInView = ({ 
  children, 
  duration = ANIMATION.DURATION.MEDIUM, 
  delay = 0, 
  fromValue = 0.8,
  style,
  ...props 
}) => {
  const scaleAnim = useScale(duration, delay, fromValue);

  return (
    <Animated.View
      style={[
        style,
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
      {...props}
    >
      {children}
    </Animated.View>
  );
};

/**
 * Slide In View Component
 */
export const SlideInView = ({ 
  children, 
  duration = ANIMATION.DURATION.MEDIUM, 
  delay = 0, 
  fromValue = 50,
  direction = 'up', // 'up', 'down', 'left', 'right'
  style,
  ...props 
}) => {
  const slideAnim = useSlide(duration, delay, fromValue);

  const getTransform = () => {
    switch (direction) {
      case 'up':
        return [{ translateY: slideAnim }];
      case 'down':
        return [{ translateY: Animated.multiply(slideAnim, -1) }];
      case 'left':
        return [{ translateX: slideAnim }];
      case 'right':
        return [{ translateX: Animated.multiply(slideAnim, -1) }];
      default:
        return [{ translateY: slideAnim }];
    }
  };

  return (
    <Animated.View
      style={[
        style,
        {
          transform: getTransform(),
        },
      ]}
      {...props}
    >
      {children}
    </Animated.View>
  );
};

/**
 * Bounce View Component
 */
export const BounceView = ({ 
  children, 
  trigger = false,
  duration = ANIMATION.DURATION.SHORT,
  style,
  ...props 
}) => {
  const bounceAnim = useBounce(trigger, duration);

  return (
    <Animated.View
      style={[
        style,
        {
          transform: [{ scale: bounceAnim }],
        },
      ]}
      {...props}
    >
      {children}
    </Animated.View>
  );
};

/**
 * Pulse View Component
 */
export const PulseView = ({ 
  children, 
  active = true,
  duration = ANIMATION.DURATION.LONG,
  style,
  ...props 
}) => {
  const pulseAnim = usePulse(active, duration);

  return (
    <Animated.View
      style={[
        style,
        {
          transform: [{ scale: pulseAnim }],
        },
      ]}
      {...props}
    >
      {children}
    </Animated.View>
  );
};

/**
 * Staggered Animation Container
 * Animates children with staggered delays
 */
export const StaggeredView = ({ 
  children, 
  staggerDelay = 100,
  animationType = 'fadeIn', // 'fadeIn', 'scaleIn', 'slideIn'
  style,
  ...props 
}) => {
  const childrenArray = React.Children.toArray(children);

  const renderChild = (child, index) => {
    const delay = index * staggerDelay;
    
    switch (animationType) {
      case 'fadeIn':
        return (
          <FadeInView key={index} delay={delay}>
            {child}
          </FadeInView>
        );
      case 'scaleIn':
        return (
          <ScaleInView key={index} delay={delay}>
            {child}
          </ScaleInView>
        );
      case 'slideIn':
        return (
          <SlideInView key={index} delay={delay}>
            {child}
          </SlideInView>
        );
      default:
        return (
          <FadeInView key={index} delay={delay}>
            {child}
          </FadeInView>
        );
    }
  };

  return (
    <Animated.View style={style} {...props}>
      {childrenArray.map(renderChild)}
    </Animated.View>
  );
};

// === UTILITY FUNCTIONS ===

/**
 * Create a spring animation
 */
export const createSpringAnimation = (
  animatedValue,
  toValue,
  config = {}
) => {
  return Animated.spring(animatedValue, {
    toValue,
    tension: 100,
    friction: 8,
    useNativeDriver: true,
    ...config,
  });
};

/**
 * Create a timing animation
 */
export const createTimingAnimation = (
  animatedValue,
  toValue,
  duration = ANIMATION.DURATION.MEDIUM,
  easing = Easing.out(Easing.cubic)
) => {
  return Animated.timing(animatedValue, {
    toValue,
    duration,
    easing,
    useNativeDriver: true,
  });
};

/**
 * Create a sequence of animations
 */
export const createSequence = (animations) => {
  return Animated.sequence(animations);
};

/**
 * Create parallel animations
 */
export const createParallel = (animations) => {
  return Animated.parallel(animations);
};

/**
 * Create staggered animations
 */
export const createStagger = (delay, animations) => {
  return Animated.stagger(delay, animations);
};
