// APOPHIS - Input Handling
// Keyboard, gamepad, and touch input management

import * as State from './state.js';

// Touch state
let touchStartX = 0;
let touchCurrentX = 0;
let touchLastX = 0;
let touchActive = false;
let touchVelocity = 0;
let movementTouchId = null; // Track which touch is for movement

// Touch control zones (will be set based on screen size)
let touchZones = {
    shoot: null,
    shield: null,
    boomba: null,
    missile: null,
    weaponCycle: null,
    weaponFire: null,
    boombaCycle: null
};

/**
 * Initialize input event listeners
 */
export function initInput() {
    // Keyboard events
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // Gamepad events
    window.addEventListener('gamepadconnected', handleGamepadConnected);
    window.addEventListener('gamepaddisconnected', handleGamepadDisconnected);
    
    // Touch events
    initTouchControls();
    
    // Tilt events (will be enabled when user taps tilt button)
    // Android: works immediately
    // iOS: requires permission request
}

/**
 * Initialize touch controls for mobile
 */
function initTouchControls() {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) return;
    
    // Prevent default touch behaviors
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    canvas.addEventListener('touchcancel', handleTouchEnd, { passive: false });
    
    // Update touch zones on resize
    window.addEventListener('resize', updateTouchZones);
    updateTouchZones();
}

/**
 * Update touch control zones based on screen size
 */
function updateTouchZones() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    
    // Only enable touch zones on mobile
    if (w >= 600) {
        touchZones = { shoot: null, shield: null, boomba: null, missile: null, weaponCycle: null, weaponFire: null, boombaCycle: null };
        return;
    }
    
    // Left side vertical button layout - match render.js positions
    const btnSize = 45;
    const leftMargin = 15;
    const smallPadding = 8;
    const largePadding = 18;
    
    // Calculate positions from bottom up
    const bottomY = h - 40 - btnSize;
    
    // W▼ (weapon cycle) - bottom
    touchZones.weaponCycle = {
        x: leftMargin,
        y: bottomY,
        width: btnSize,
        height: btnSize
    };
    
    // WEAPON (fire weapon) - above W▼ with small padding
    touchZones.weaponFire = {
        x: leftMargin,
        y: bottomY - btnSize - smallPadding,
        width: btnSize,
        height: btnSize
    };
    
    // B▼ (boomba cycle) - above WEAPON with large padding
    touchZones.boombaCycle = {
        x: leftMargin,
        y: bottomY - (btnSize + smallPadding) - btnSize - largePadding,
        width: btnSize,
        height: btnSize
    };
    
    // BOOM (fire boomba) - above B▼ with small padding
    touchZones.boomba = {
        x: leftMargin,
        y: bottomY - (btnSize + smallPadding) - (btnSize + largePadding) - btnSize - smallPadding,
        width: btnSize,
        height: btnSize
    };
    
    // MISL - above BOOM with large padding
    touchZones.missile = {
        x: leftMargin,
        y: bottomY - (btnSize + smallPadding) - (btnSize + largePadding) - (btnSize + smallPadding) - btnSize - largePadding,
        width: btnSize,
        height: btnSize
    };
    
    // SHLD - above MISL with large padding
    touchZones.shield = {
        x: leftMargin,
        y: bottomY - (btnSize + smallPadding) - (btnSize + largePadding) - (btnSize + smallPadding) - (btnSize + largePadding) - btnSize - largePadding,
        width: btnSize,
        height: btnSize
    };
    
    // Keep shoot for auto-fire compatibility
    touchZones.shoot = null;
        height: btnSize
    };
    
    // No separate shoot button - shooting happens while moving
    touchZones.shoot = null;
}

/**
 * Check if a point is inside a zone
 */
function isInZone(x, y, zone) {
    if (!zone) return false;
    return x >= zone.x && x <= zone.x + zone.width &&
           y >= zone.y && y <= zone.y + zone.height;
}

/**
 * Handle touch start
 */
function handleTouchStart(e) {
    e.preventDefault();
    
    for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        const x = touch.clientX;
        const y = touch.clientY;
        
        // If game is over, any tap triggers restart
        if (State.gameOver && State.deathTimer <= 0) {
            State.setTouchButton('restart', true);
            // Clear it after a short delay so it only triggers once
            setTimeout(() => State.setTouchButton('restart', false), 100);
            return;
        }
        
        // Check button zones
        if (isInZone(x, y, touchZones.shield)) {
            State.setTouchButton('shield', true);
        } else if (isInZone(x, y, touchZones.missile)) {
            State.setTouchButton('missile', true);
        } else if (isInZone(x, y, touchZones.boomba)) {
            State.setTouchButton('boomba', true);
        } else if (isInZone(x, y, touchZones.boombaCycle)) {
            State.setTouchButton('boombaCycle', true);
        } else if (isInZone(x, y, touchZones.weaponFire)) {
            State.setTouchButton('weaponFire', true);
        } else if (isInZone(x, y, touchZones.weaponCycle)) {
            State.setTouchButton('weaponCycle', true);
        } else if (movementTouchId === null) {
            // Movement touch - only if not already tracking one
            movementTouchId = touch.identifier;
            touchStartX = x;
            touchCurrentX = x;
            touchLastX = x;
            touchActive = true;
            touchVelocity = 0;
        }
    }
}

/**
 * Handle touch move
 */
function handleTouchMove(e) {
    e.preventDefault();
    
    for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        
        // Only update movement for the movement touch
        if (touch.identifier === movementTouchId) {
            touchCurrentX = touch.clientX;
            
            // Calculate velocity based on movement since last frame
            // This makes the ship respond to finger DIRECTION, not distance from start
            const delta = touchCurrentX - touchLastX;
            touchLastX = touchCurrentX;
            
            // Scale and clamp velocity
            // A quick swipe of 10px per frame = full speed
            const sensitivity = 0.12;
            touchVelocity = Math.max(-1, Math.min(1, delta * sensitivity));
        }
    }
}

/**
 * Handle touch end
 */
function handleTouchEnd(e) {
    e.preventDefault();
    
    // Check which touches ended
    for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        const x = touch.clientX;
        const y = touch.clientY;
        
        // Check if this was the movement touch
        if (touch.identifier === movementTouchId) {
            movementTouchId = null;
            touchActive = false;
            touchVelocity = 0;
        }
        
        // Check if touch was in button zones and release those buttons
        if (isInZone(x, y, touchZones.shield)) {
            State.setTouchButton('shield', false);
        }
        if (isInZone(x, y, touchZones.missile)) {
            State.setTouchButton('missile', false);
        }
        if (isInZone(x, y, touchZones.boomba)) {
            State.setTouchButton('boomba', false);
        }
        if (isInZone(x, y, touchZones.boombaCycle)) {
            State.setTouchButton('boombaCycle', false);
        }
        if (isInZone(x, y, touchZones.weaponFire)) {
            State.setTouchButton('weaponFire', false);
        }
        if (isInZone(x, y, touchZones.weaponCycle)) {
            State.setTouchButton('weaponCycle', false);
        }
    }
    
    // If no touches remain, reset everything
    if (e.touches.length === 0) {
        movementTouchId = null;
        touchActive = false;
        touchVelocity = 0;
        State.setTouchButton('shield', false);
        State.setTouchButton('missile', false);
        State.setTouchButton('boomba', false);
        State.setTouchButton('boombaCycle', false);
        State.setTouchButton('weaponFire', false);
        State.setTouchButton('weaponCycle', false);
    }
}

/**
 * Get touch movement value (for ship control)
 */
export function getTouchMovement() {
    if (!touchActive) return 0;
    return touchVelocity;
}

/**
 * Check if touch shooting is active
 */
export function isTouchShooting() {
    return State.touchButtons?.shoot || false;
}

/**
 * Check if touch shield is active
 */
export function isTouchShielding() {
    return State.touchButtons?.shield || false;
}

/**
 * Check if touch boomba is active
 */
export function isTouchBoomba() {
    return State.touchButtons?.boomba || false;
}

/**
 * Check if touch missile is active
 */
export function isTouchMissile() {
    return State.touchButtons?.missile || false;
}

/**
 * Check if touch weapon up is active
 */
export function isTouchWeaponUp() {
    return State.touchButtons?.weaponUp || false;
}

/**
 * Check if we're on a touch device
 */
export function isTouchDevice() {
    return window.innerWidth < 600 && ('ontouchstart' in window);
}

/**
 * Handle key down events
 */
function handleKeyDown(e) {
    // Ignore auto-repeat events (when key is held down)
    if (e.repeat) return;
    
    // Only set justPressed if key wasn't already down
    const wasPressed = State.keys[e.code];
    if (!wasPressed) {
        State.setJustPressed(e.code, true);
    }
    
    State.setKey(e.code, true);
    
    // Prevent default for space to avoid page scroll
    if (e.code === 'Space') {
        e.preventDefault();
    }
    
    // Set missile request flag only on first press (not held)
    if (e.code === 'KeyV' && !wasPressed) {
        State.setMissileRequested(true);
    }
}

/**
 * Handle key up events
 */
function handleKeyUp(e) {
    State.setKey(e.code, false);
}

/**
 * Handle gamepad connection
 */
function handleGamepadConnected(e) {
    State.setGamepadConnected(true);
    console.log('Gamepad connected:', e.gamepad.id);
    console.log('Gamepad has', e.gamepad.buttons.length, 'buttons and', e.gamepad.axes.length, 'axes');
    console.log('To debug gamepad inputs, set State.debugGamepad = true');
    updateInstructionsDisplay();
}

/**
 * Handle gamepad disconnection
 */
function handleGamepadDisconnected(e) {
    State.setGamepadConnected(false);
    State.setGamepad(null);
    console.log('Gamepad disconnected');
    updateInstructionsDisplay();
}

/**
 * Update the instructions display based on input method
 */
export function updateInstructionsDisplay() {
    const instructionsEl = document.getElementById('instructions');
    if (!instructionsEl) return;
    
    if (isTouchDevice()) {
        instructionsEl.innerHTML = '👆 Drag to move | Tap buttons to fire/shield/boomba/missile';
    } else if (State.gamepadConnected) {
        instructionsEl.innerHTML = '🎮 Controller: D-Pad/L-Stick Move | A Shoot | X Missile | B Shield | Y Boomba | L/R Weapon | Start Restart';
    } else {
        instructionsEl.innerHTML = '←→/AD Move | Z/SPACE Shoot | V Missile | X Shield | C Boomba | ↑/W Weapon | ↓/S Boomba | R Restart';
    }
}

/**
 * Poll gamepad state - call each frame
 */
export function pollGamepad() {
    if (!State.gamepadConnected) {
        if (State.debugGamepad) console.log('pollGamepad: not connected');
        return;
    }

    if (State.debugGamepad && Math.random() < 0.01) {
        console.log('pollGamepad: running...');
    }

    const gamepads = navigator.getGamepads();
    let gamepad = null;

    // Find the first connected gamepad
    for (let i = 0; i < gamepads.length; i++) {
        if (gamepads[i]) {
            gamepad = gamepads[i];
            break;
        }
    }

    if (!gamepad) {
        State.setGamepadConnected(false);
        return;
    }

    State.setGamepad(gamepad);

    // Store previous button states
    State.setGamepadPrevButtons({...State.gamepadButtons});

    // D-pad support (check both buttons and axes)
    let dpadLeft = false, dpadRight = false, dpadUp = false, dpadDown = false;

    // Check D-pad as buttons (12-15)
    if (gamepad.buttons[12]) dpadUp = gamepad.buttons[12].pressed;
    if (gamepad.buttons[13]) dpadDown = gamepad.buttons[13].pressed;
    if (gamepad.buttons[14]) dpadLeft = gamepad.buttons[14].pressed;
    if (gamepad.buttons[15]) dpadRight = gamepad.buttons[15].pressed;

    // Check D-pad as axes (common on Switch Pro Controller and others)
    if (gamepad.axes[6] !== undefined) {
        if (gamepad.axes[6] < -0.5) dpadLeft = true;
        if (gamepad.axes[6] > 0.5) dpadRight = true;
    }
    if (gamepad.axes[7] !== undefined) {
        if (gamepad.axes[7] < -0.5) dpadUp = true;
        if (gamepad.axes[7] > 0.5) dpadDown = true;
    }

    // Alternative axes (9.x for some controllers)
    if (gamepad.axes[9] !== undefined) {
        if (gamepad.axes[9] < -0.5) dpadLeft = true;
        if (gamepad.axes[9] > 0.5) dpadRight = true;
    }

    const buttons = {
        shoot: gamepad.buttons[0]?.pressed || false,    // A button (or B on Switch)
        shield: gamepad.buttons[1]?.pressed || false,   // B button (or A on Switch)
        missile: gamepad.buttons[2]?.pressed || false,  // X button (or Y on Switch)
        boomba: gamepad.buttons[3]?.pressed || false,   // Y button (or X on Switch)
        weaponPrev: gamepad.buttons[4]?.pressed || false, // LB
        weaponNext: gamepad.buttons[5]?.pressed || false, // RB
        restart: gamepad.buttons[9]?.pressed || false,  // Start button

        // D-pad (unified from buttons and axes)
        dpadUp: dpadUp,
        dpadDown: dpadDown,
        dpadLeft: dpadLeft,
        dpadRight: dpadRight,

        // Left stick axes
        leftStickX: gamepad.axes[0] || 0,
        leftStickY: gamepad.axes[1] || 0
    };

    State.setGamepadButtons(buttons);

    // Debug logging
    if (State.debugGamepad && (Object.values(buttons).some(v => v === true || Math.abs(v) > 0.5))) {
        console.log('Gamepad state:', {
            buttons: Object.entries(buttons).filter(([k,v]) => v === true || Math.abs(v) > 0.5),
            rawAxes: Array.from(gamepad.axes).map((v, i) => `${i}:${v.toFixed(2)}`).filter(s => !s.endsWith('0.00'))
        });
    }
}

/**
 * Check if a gamepad button was just pressed this frame
 */
export function isGamepadButtonJustPressed(button) {
    return State.gamepadButtons[button] && !State.gamepadPrevButtons[button];
}

/**
 * Check if a touch button was just pressed this frame
 */
export function isTouchButtonJustPressed(button) {
    return State.touchButtons[button] && !State.touchPrevButtons[button];
}

/**
 * Check if movement left is pressed (keyboard or gamepad)
 */
export function isMovingLeft() {
    return State.keys['ArrowLeft'] || State.keys['KeyA'] || State.gamepadButtons.dpadLeft;
}

/**
 * Check if movement right is pressed (keyboard or gamepad)
 */
export function isMovingRight() {
    return State.keys['ArrowRight'] || State.keys['KeyD'] || State.gamepadButtons.dpadRight;
}

/**
 * Check if fire button is pressed (keyboard, gamepad, or touch)
 */
export function isFiring() {
    return State.keys['KeyZ'] || State.keys['Space'] || State.gamepadButtons.shoot || State.touchButtons.weaponFire || touchActive;
}

/**
 * Check if shield button is pressed (keyboard, gamepad, or touch)
 */
export function isShielding() {
    return State.keys['KeyX'] || State.gamepadButtons.shield || State.touchButtons.shield;
}

/**
 * Check if boomba button is pressed (keyboard, gamepad, or touch)
 */
export function isBoombaPresseed() {
    return State.keys['KeyC'] || State.gamepadButtons.boomba || State.touchButtons.boomba;
}

/**
 * Check if missile key was pressed (keyboard only - gamepad and touch handled separately)
 */
export function isMissileKeyPressed() {
    return State.keys['KeyV'];
}

/**
 * Check if restart key is pressed
 */
export function isRestartPressed() {
    return State.keys['KeyR'] || isGamepadButtonJustPressed('restart') || isTouchRestart();
}

/**
 * Check if touch restart was triggered (any tap when game over on mobile)
 */
function isTouchRestart() {
    if (State.width >= 600) return false;
    // Touch restart is set when tapping anywhere during game over
    return State.touchButtons?.restart || false;
}

/**
 * Check weapon cycle up (keyboard or touch) - triggers once per press
 */
export function isWeaponUpPressed() {
    return State.justPressed['ArrowUp'] || State.justPressed['KeyW'] || isTouchButtonJustPressed('weaponUp');
}

/**
 * Check boomba cycle (keyboard Down/S or touch) - triggers once per press
 */
export function isBoombaCyclePressed() {
    return State.justPressed['ArrowDown'] || State.justPressed['KeyS'] || isTouchButtonJustPressed('boombaCycle');
}

/**
 * Get left stick X axis value (with deadzone)
 */
export function getLeftStickX() {
    const value = State.gamepadButtons.leftStickX || 0;
    const deadzone = 0.2;
    return Math.abs(value) > deadzone ? value : 0;
}
