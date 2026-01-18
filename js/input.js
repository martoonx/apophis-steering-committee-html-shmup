// APOPHIS - Input Handling
// Keyboard and gamepad input management

import * as State from './state.js';

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
}

/**
 * Handle key down events
 */
function handleKeyDown(e) {
    State.setKey(e.code, true);
    
    // Prevent default for space to avoid page scroll
    if (e.code === 'Space') {
        e.preventDefault();
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
    
    if (State.gamepadConnected) {
        instructionsEl.innerHTML = '🎮 Controller: D-Pad/L-Stick Move | A Shoot | X Missile | B Shield | Y Boomba | L/R Weapon | Start Restart';
    } else {
        instructionsEl.innerHTML = '←→/AD Move | Z/SPACE Shoot | V Missile | X Shield | C Boomba | ↑↓/WS Weapon | R Restart';
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
 * Check if fire button is pressed (keyboard or gamepad)
 */
export function isFiring() {
    return State.keys['KeyZ'] || State.keys['Space'] || State.gamepadButtons.shoot;
}

/**
 * Check if shield button is pressed (keyboard or gamepad)
 */
export function isShielding() {
    return State.keys['KeyX'] || State.gamepadButtons.shield;
}

/**
 * Check if boomba button is pressed (keyboard or gamepad)
 */
export function isBoombaPresseed() {
    return State.keys['KeyC'] || State.gamepadButtons.boomba;
}

/**
 * Check if missile key was pressed (keyboard only - gamepad handled separately)
 */
export function isMissileKeyPressed() {
    return State.keys['KeyV'];
}

/**
 * Check if restart key is pressed
 */
export function isRestartPressed() {
    return State.keys['KeyR'] || isGamepadButtonJustPressed('restart');
}

/**
 * Check weapon cycle up
 */
export function isWeaponUpPressed() {
    return State.keys['ArrowUp'] || State.keys['KeyW'];
}

/**
 * Check weapon cycle down
 */
export function isWeaponDownPressed() {
    return State.keys['ArrowDown'] || State.keys['KeyS'];
}

/**
 * Get left stick X axis value (with deadzone)
 */
export function getLeftStickX() {
    const value = State.gamepadButtons.leftStickX || 0;
    const deadzone = 0.2;
    return Math.abs(value) > deadzone ? value : 0;
}
