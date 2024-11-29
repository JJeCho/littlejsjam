'use strict';
import * as ljs from "littlejsengine";

const levelSize = ljs.vec2(38, 20); // size of play area
const sound_bounce = new ljs.Sound([,,1e3,,.03,.02,1,2,,,940,.03,,,,,.2,.6,,.06], 0);
const sound_break = new ljs.Sound([,,90,,.01,.03,4,,,,,,,9,50,.2,,.2,.01], 0);
const sound_start = new ljs.Sound([,0,500,,.04,.3,1,2,,,570,.02,.02,,,,.04]);
let ball; // keep track of ball object
let score = 0;
let paddle;

class Paddle extends ljs.EngineObject
{
    constructor()
    {
        super(ljs.vec2(0,1), ljs.vec2(6,.5)); // set object position and size
        this.setCollision(); // make object collide
        this.mass = 0; // make object have static physics
    }
    update()
    {
        this.pos.x = ljs.mousePos.x; // move paddle to mouse
        this.pos.x = ljs.clamp(this.pos.x, this.size.x/2, levelSize.x - this.size.x/2);
    }
}
class Ball extends ljs.EngineObject
{
    constructor(pos)
    {
        super(pos, ljs.vec2(.5)); // set object position and size
        this.setCollision(); // make object collide
        this.velocity = ljs.vec2(-.1, -.1); // give ball some movement
        this.elasticity = 1; // make object bounce
    }

    collideWithObject(o)
    {
        // prevent colliding with paddle if moving upwards
        const speed = ljs.min(1.04*this.velocity.length(), .5);
        if (o == paddle && this.velocity.y > 0)
            return false;

        if (o == paddle)
        {
            // control bounce angle when ball collides with paddle
            const deltaX = this.pos.x - o.pos.x;
            this.velocity = this.velocity.rotate(.3 * deltaX);
            
            // make sure ball is moving upwards with a minimum speed
            this.velocity.y = ljs.max(-this.velocity.y, .2);
            this.velocity = this.velocity.normalize(speed);
            // prevent default collision code
            return false;
        }
        sound_bounce.play(this.pos, 1, speed);
        return true; // allow object to collide
    }
}
class Wall extends ljs.EngineObject
{
    constructor(pos, size)
    {
        
        super(pos, size); // set object position and size

        this.setCollision(); // make object collide
        this.mass = 0; // make object have static physics
        this.color = new ljs.Color(0,0,0,0); // make object invisible
    }
}

class Brick extends ljs.EngineObject
{
    constructor(pos, size)
    {
        super(pos, size);

        this.setCollision(); // make object collide
        this.mass = 0; // make object have static physics
    }

    collideWithObject(o)
    {
        this.destroy(); // destroy block when hit
        sound_break.play(this.pos); // play brick break sound
        ++score;
        // create explosion effect
        const color = this.color;
        new ljs.ParticleEmitter(
            this.pos, 0,            // pos, angle
            this.size, .1, 200, Math.PI, // emitSize, emitTime, emitRate, emiteCone
            undefined,              // tileInfo
            color, color,           // colorStartA, colorStartB
            color.scale(1,0), color.scale(1,0), // colorEndA, colorEndB
            .2, .5, 1, .1, .1,  // time, sizeStart, sizeEnd, speed, angleSpeed
            .99, .95, .4, Math.PI,   // damping, angleDamping, gravityScale, cone
            .1, .5, false, true // fadeRate, randomness, collide, additive
        );
        return true;
    }
}
function gameInit() {
    for(let x=2;  x<=levelSize.x-2; x+=2)
        for(let y=12; y<=levelSize.y-2; y+=1)
        {
            const brick = new Brick(ljs.vec2(x,y), ljs.vec2(2,1)); // create a brick
            brick.color = ljs.randColor(); // give brick a random color
        }
    ljs.setCameraPos(levelSize.scale(.5)); // center camera in level
    ljs.setCanvasFixedSize(ljs.vec2(1280, 720)); // use a 720p fixed size canvas

    paddle = new Paddle();
    if (!ball || ball.pos.y < -1)
        {
            // destroy old ball
            if (ball)
                ball.destroy();
        
            // create a ball
            ball = new Ball(ljs.cameraPos);
        }
    new Wall(ljs.vec2(-.5,levelSize.y/2),            ljs.vec2(1,100)) // left
    new Wall(ljs.vec2(levelSize.x+.5,levelSize.y/2), ljs.vec2(1,100)) // right
    new Wall(ljs.vec2(levelSize.x/2,levelSize.y+.5), ljs.vec2(100,2)) // top
}
function gameUpdate() {
    if (ball && ball.pos.y < -1) // if ball is below level
    {
        // destroy old ball
        ball.destroy();
        ball = 0;
    }
    if (!ball && mouseWasPressed(0)) // if there is no ball and left mouse is pressed
    {
        ball = new Ball(ljs.cameraPos); // create the ball
        sound_start.play(); // play start sound
    }
}
function gameUpdatePost() { }
function gameRender() {
    ljs.drawRect(ljs.cameraPos, ljs.vec2(100), new ljs.Color(.5,.5,.5)); // draw background
    ljs.drawRect(ljs.cameraPos, levelSize, new ljs.Color(.1,.1,.1)); // draw level boundary
}

function gameRenderPost() { 
    ljs.drawTextScreen("Score " + score, ljs.vec2(ljs.mainCanvasSize.x/2, 70), 50); // show score
}
ljs.engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost);