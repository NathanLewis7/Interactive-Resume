const player = document.getElementById("player");
const world = document.getElementById("world");

let playerX = 100;
let playerY = 0;


/* ========================= */
/* RETURN LOCATION */
/* ========================= */

const returnLocation =
    new URLSearchParams(
        window.location.search
    ).get("return");

if (
    returnLocation === "home"
) {

    playerX = 1370;

}

if (
    returnLocation === "experience"
) {

    playerX = 4120;

}

if (
    returnLocation === "portfolio"
) {

    playerX = 6120;

}


let velocityY = 0;

let movingLeft = false;
let movingRight = false;

let onGround = true;

const speed = 5;
const jumpPower = 20;
const gravity = 0.7;

const playerWidth = 60;
const playerHeight = 110;


/* ========================= */
/* KEYBOARD */
/* ========================= */

document.addEventListener("keydown", function(event) {

    if (event.key === "a" || event.key === "A") {

        movingLeft = true;

    }


    if (event.key === "d" || event.key === "D") {

        movingRight = true;

    }


    if (
        event.code === "Space" &&
        onGround
    ) {

        velocityY = jumpPower;

        onGround = false;

    }


    if (event.key === "Enter") {

        checkDoor();

    }

});


document.addEventListener("keyup", function(event) {

    if (event.key === "a" || event.key === "A") {

        movingLeft = false;

    }


    if (event.key === "d" || event.key === "D") {

        movingRight = false;

    }

});


/* ========================= */
/* OBJECT POSITION */
/* ========================= */

function getObjectData(object) {

    const left =
        object.offsetLeft;

    const right =
        left +
        object.offsetWidth;

    const groundHeight =
        window.innerHeight * 0.30;

    const bottomStyle =
        getComputedStyle(object).bottom;

    let bottomValue;


    if (
        bottomStyle.includes("vh")
    ) {

        bottomValue =
            parseFloat(bottomStyle) *
            window.innerHeight / 100;

    } else {

        bottomValue =
            parseFloat(bottomStyle);

    }


    const bottomFromGround =
        bottomValue -
        groundHeight;

    const topFromGround =
        bottomFromGround +
        object.offsetHeight;


    return {

        left: left,

        right: right,

        bottom: bottomFromGround,

        top: topFromGround

    };

}


/* ========================= */
/* SOLID OBJECTS */
/* ========================= */

function getSolidObjects() {

    return document.querySelectorAll(
        ".platform, .rock"
    );

}


/* ========================= */
/* MOUNTAIN */
/* ========================= */

const mountainLeft = 2300;

const mountainWidth = 1500;

const mountainHeight = 760;


const mountainPoints = [

    { x: 0.00, y: 1.00 },

    { x: 0.08, y: 0.85 },

    { x: 0.16, y: 0.76 },

    { x: 0.24, y: 0.64 },

    { x: 0.32, y: 0.56 },

    { x: 0.40, y: 0.43 },

    { x: 0.48, y: 0.30 },

    { x: 0.56, y: 0.15 },

    { x: 0.62, y: 0.00 },

    { x: 0.68, y: 0.16 },

    { x: 0.76, y: 0.32 },

    { x: 0.84, y: 0.51 },

    { x: 0.92, y: 0.73 },

    { x: 1.00, y: 1.00 }

];


/* ========================= */
/* MOUNTAIN SURFACE */
/* ========================= */

function getMountainSurface(localX) {

    if (
        localX < 0 ||
        localX > mountainWidth
    ) {

        return null;

    }


    const percent =
        localX /
        mountainWidth;


    for (
        let i = 0;
        i < mountainPoints.length - 1;
        i++
    ) {

        const point1 =
            mountainPoints[i];

        const point2 =
            mountainPoints[i + 1];


        if (
            percent >= point1.x &&
            percent <= point2.x
        ) {

            const range =
                point2.x -
                point1.x;


            const amount =
                (
                    percent -
                    point1.x
                ) /
                range;


            const heightPercent =
                point1.y +
                (
                    point2.y -
                    point1.y
                ) *
                amount;


            return (
                mountainHeight *
                (
                    1 -
                    heightPercent
                )
            );

        }

    }


    return 0;

}


/* ========================= */
/* PLAYER MOUNTAIN SURFACE */
/* ========================= */

function getPlayerMountainSurface(x) {

    /*
        Use the player's FEET CENTER
        to determine the slope.

        This prevents the player from
        getting stuck on the sides.
    */

    const playerCenter =
        x +
        playerWidth / 2;


    const localX =
        playerCenter -
        mountainLeft;


    return getMountainSurface(localX);

}


/* ========================= */
/* MOUNTAIN CHECK */
/* ========================= */

function isPlayerOverMountain() {

    const playerLeft =
        playerX;

    const playerRight =
        playerX +
        playerWidth;


    return (
        playerRight >
        mountainLeft
        &&
        playerLeft <
        mountainLeft +
        mountainWidth
    );

}


/* ========================= */
/* MOUNTAIN COLLISION */
/* ========================= */

function checkMountainCollision(oldY) {

    if (
        !isPlayerOverMountain()
    ) {

        return false;

    }


    const surface =
        getPlayerMountainSurface(
            playerX
        );


    if (
        surface === null
    ) {

        return false;

    }


    /*
        PLAYER IS FALLING ONTO
        THE MOUNTAIN.
    */

    if (
        velocityY <= 0
        &&
        oldY >= surface
        &&
        playerY <= surface
    ) {

        playerY =
            surface;

        velocityY = 0;

        onGround = true;

        return true;

    }


    /*
        PLAYER IS WALKING ON
        THE MOUNTAIN.

        This is the important part.
    */

    if (
        onGround
        &&
        playerY < surface + 30
    ) {

        playerY =
            surface;

        velocityY = 0;

        return true;

    }


    /*
        EMERGENCY FIX.

        If the player somehow gets
        BELOW the mountain surface,
        immediately put them back
        on the mountain.

        This prevents falling through
        the mountain.
    */

    if (
        playerY < surface
    ) {

        playerY =
            surface;

        velocityY = 0;

        onGround = true;

        return true;

    }


    return false;

}


/* ========================= */
/* MOUNTAIN SIDE COLLISION */
/* ========================= */

function checkMountainSideCollision(newX) {

    const center =
        newX +
        playerWidth / 2;


    const localX =
        center -
        mountainLeft;


    /*
        Outside the mountain.
    */

    if (
        localX < 0 ||
        localX > mountainWidth
    ) {

        return false;

    }


    const surface =
        getMountainSurface(
            localX
        );


    if (
        surface === null
    ) {

        return false;

    }


    /*
        If the player's feet are
        below the mountain surface,
        do not allow them to move
        through the mountain.
    */

    if (
        playerY + 5 <
        surface
    ) {

        return true;

    }


    return false;

}


/* ========================= */
/* HORIZONTAL COLLISION */
/* ========================= */

function checkHorizontalCollision(newX) {

    const objects =
        getSolidObjects();


    const playerLeft =
        newX;

    const playerRight =
        newX +
        playerWidth;

    const playerBottom =
        playerY;

    const playerTop =
        playerY +
        playerHeight;


    for (
        let object of objects
    ) {

        const rect =
            getObjectData(object);


        const horizontalOverlap =
            playerRight >
            rect.left
            &&
            playerLeft <
            rect.right;


        const verticalOverlap =
            playerTop >
            rect.bottom
            &&
            playerBottom <
            rect.top;


        if (
            horizontalOverlap &&
            verticalOverlap
        ) {

            return true;

        }

    }


    /*
        Mountain collision.
    */

    if (
        checkMountainSideCollision(
            newX
        )
    ) {

        return true;

    }


    return false;

}


/* ========================= */
/* PLATFORM LANDING */
/* ========================= */

function checkPlatformLanding(oldY) {

    const objects =
        getSolidObjects();


    let landed = false;


    for (
        let object of objects
    ) {

        const rect =
            getObjectData(object);


        const playerLeft =
            playerX;

        const playerRight =
            playerX +
            playerWidth;


        const horizontalOverlap =
            playerRight >
            rect.left
            &&
            playerLeft <
            rect.right;


        if (
            !horizontalOverlap
        ) {

            continue;

        }


        if (
            velocityY <= 0
        ) {

            if (
                oldY >= rect.top
                &&
                playerY <= rect.top
            ) {

                playerY =
                    rect.top;

                velocityY = 0;

                onGround = true;

                landed = true;

            }

        }

    }


    return landed;

}


/* ========================= */
/* MOUNTAIN FIRES */
/* ========================= */

function positionMountainFires() {

    const fires =
        document.querySelectorAll(
            ".mountain-fire"
        );


    for (
        let fire of fires
    ) {

        const fireCenter =
            fire.offsetLeft +
            fire.offsetWidth / 2;


        const localX =
            fireCenter -
            mountainLeft;


        const surface =
            getMountainSurface(
                localX
            );


        if (
            surface === null
        ) {

            continue;

        }


        fire.style.bottom =
            `calc(30vh + ${surface}px)`;

    }

}


/* ========================= */
/* FIRE */
/* ========================= */

function getFireBottom(fire) {

    const groundHeight =
        window.innerHeight * 0.30;


    const bottomStyle =
        getComputedStyle(
            fire
        ).bottom;


    let bottomValue;


    if (
        bottomStyle.includes("vh")
    ) {

        bottomValue =
            parseFloat(bottomStyle) *
            window.innerHeight / 100;

    } else {

        bottomValue =
            parseFloat(bottomStyle);

    }


    return (
        bottomValue -
        groundHeight
    );

}


function checkFire() {

    const fires =
        document.querySelectorAll(
            ".fire"
        );


    for (
        let fire of fires
    ) {

        const fireX =
            fire.offsetLeft;

        const fireRight =
            fireX +
            fire.offsetWidth;


        const fireBottom =
            getFireBottom(
                fire
            );


        const fireTop =
            fireBottom +
            fire.offsetHeight;


        const playerLeft =
            playerX;

        const playerRight =
            playerX +
            playerWidth;

        const playerBottom =
            playerY;

        const playerTop =
            playerY +
            playerHeight;


        const horizontalHit =
            playerRight >
            fireX
            &&
            playerLeft <
            fireRight;


        const verticalHit =
            playerTop >
            fireBottom
            &&
            playerBottom <
            fireTop;


        if (
            horizontalHit &&
            verticalHit
        ) {

            if (
                playerX <
                fireX
            ) {

                playerX =
                    fireX -
                    playerWidth -
                    70;

            } else {

                playerX =
                    fireRight +
                    70;

            }


            velocityY =
                jumpPower *
                0.6;


            onGround = false;

        }

    }

}


/* ========================= */
/* NORMAL MOBS */
/* ========================= */

function checkMobs() {

    const mobs =
        document.querySelectorAll(
            ".big-mob:not(.mountain-mob)"
        );


    for (
        let mob of mobs
    ) {

        const mobX =
            mob.offsetLeft;

        const mobRight =
            mobX +
            mob.offsetWidth;


        const playerRight =
            playerX +
            playerWidth;


        const horizontalHit =
            playerRight >
            mobX
            &&
            playerX <
            mobRight;


        if (
            !horizontalHit
        ) {

            continue;

        }


        const mobBottom =
            getFireBottom(
                mob
            );


        const mobTop =
            mobBottom +
            mob.offsetHeight;


        if (
            velocityY < 0
            &&
            playerY <=
            mobTop + 20
            &&
            playerY >=
            mobTop - 20
        ) {

            mob.remove();

            velocityY =
                jumpPower *
                0.8;

            onGround = false;

        }

    }

}


/* ========================= */
/* MOUNTAIN MOB POSITION */
/* ========================= */

function positionMountainMob(mob) {

    const mobCenter =
        mob.offsetLeft +
        mob.offsetWidth / 2;


    const localX =
        mobCenter -
        mountainLeft;


    const surface =
        getMountainSurface(
            localX
        );


    if (
        surface === null
    ) {

        return;

    }


    mob.style.bottom =
        `calc(30vh + ${surface}px)`;

}


/* ========================= */
/* MOUNTAIN MOBS */
/* ========================= */

function updateMountainMobs() {

    const mobs =
        document.querySelectorAll(
            ".mountain-mob"
        );


    for (
        let mob of mobs
    ) {

        let mobX =
            mob.offsetLeft;


        const distance =
            playerX -
            mobX;


        if (
            Math.abs(distance) <
            900
        ) {

            const chaseSpeed =
                1.5;


            if (
                distance > 60
            ) {

                mobX +=
                    chaseSpeed;

            }


            if (
                distance < -60
            ) {

                mobX -=
                    chaseSpeed;

            }


            const minimumX =
                mountainLeft +
                10;


            const maximumX =
                mountainLeft +
                mountainWidth -
                mob.offsetWidth -
                10;


            if (
                mobX <
                minimumX
            ) {

                mobX =
                    minimumX;

            }


            if (
                mobX >
                maximumX
            ) {

                mobX =
                    maximumX;

            }


            mob.style.left =
                mobX + "px";

        }


        positionMountainMob(
            mob
        );

    }

}


/* ========================= */
/* MOUNTAIN MOB ATTACK */
/* ========================= */

function checkMobAttack() {

    const mobs =
        document.querySelectorAll(
            ".mountain-mob"
        );


    for (
        let mob of mobs
    ) {

        const mobX =
            mob.offsetLeft;

        const mobRight =
            mobX +
            mob.offsetWidth;


        const playerLeft =
            playerX;

        const playerRight =
            playerX +
            playerWidth;


        const horizontalHit =
            playerRight >
            mobX
            &&
            playerLeft <
            mobRight;


        if (
            !horizontalHit
        ) {

            continue;

        }


        const mobCenter =
            mobX +
            mob.offsetWidth / 2;


        const surface =
            getMountainSurface(
                mobCenter -
                mountainLeft
            );


        if (
            surface === null
        ) {

            continue;

        }


        const mobBottom =
            surface;


        const mobTop =
            mobBottom +
            mob.offsetHeight;


        const playerBottom =
            playerY;


        const playerTop =
            playerY +
            playerHeight;


        /*
            STOMP.
        */

        if (
            velocityY < 0
            &&
            playerBottom <=
            mobTop + 15
            &&
            playerBottom >=
            mobTop - 35
        ) {

            mob.remove();

            velocityY =
                jumpPower *
                0.8;

            onGround = false;

            continue;

        }


        /*
            MOB HITS PLAYER.
        */

        if (
            playerTop >
            mobBottom
            &&
            playerBottom <
            mobTop
        ) {

            if (
                playerX <
                mobX
            ) {

                playerX =
                    mobX -
                    playerWidth -
                    15;

            } else {

                playerX =
                    mobRight +
                    15;

            }


            velocityY =
                jumpPower *
                0.5;

            onGround = false;

        }

    }

}


/* ========================= */
/* DOORS */
/* ========================= */

function checkDoor() {

    const doors =
        document.querySelectorAll(
            ".cave"
        );


    doors.forEach(
        function(door) {

            const doorX =
                parseInt(
                    door.style.left
                );


            const distance =
                Math.abs(
                    playerX -
                    doorX
                );


            if (
                distance < 150
            ) {

                if (
                    door.id ===
                    "homeDoor"
                ) {

                    window.location.href =
                        "pages/homepage.html?return=home";

                }


                if (
                    door.id ===
                    "experienceDoor"
                ) {

                    window.location.href =
                        "pages/experience.html?return=experience";

                }


                if (
                    door.id ===
                    "portfolioDoor"
                ) {

                    window.location.href =
                        "pages/portfolio.html?return=portfolio";

                }

            }

        }
    );

}


/* ========================= */
/* ZOOM CAMERA */
/* ========================= */

function updateCamera() {

    let cameraX =
        playerX - 400;

    if (cameraX < 0) {
        cameraX = 0;
    }

    if (cameraX > 6300) {
        cameraX = 6300;
    }

    let zoom = 1;
    let cameraY = 0;

    /*
        START ZOOMING EARLY

        The mountain begins at 2300.
        Start zooming at 1400 so the
        camera is already zoomed out
        before reaching the mountain.
    */

    if (
        playerX >= 1400 &&
        playerX < 2200
    ) {

        const amount =
            (
                playerX - 1400
            ) /
            (
                2200 - 1400
            );

        zoom =
            1 -
            (
                amount * 0.52
            );

        cameraY =
            250 * amount;
    }

    /*
        FULL MOUNTAIN VIEW

        Keep the camera at the maximum
        zoom while traveling across
        the mountain.
    */

    if (
        playerX >= 2200 &&
        playerX <= 3700
    ) {

        zoom = 0.48;

        cameraY = 250;
    }

    /*
        START ZOOMING BACK IN BEFORE
        LEAVING THE MOUNTAIN.
    */

    if (
        playerX > 3700 &&
        playerX < 4000
    ) {

        const amount =
            (
                playerX - 3700
            ) /
            (
                4000 - 3700
            );

        zoom =
            0.48 +
            (
                amount * 0.52
            );

        cameraY =
            250 -
            (
                amount * 250
            );
    }

    /*
        NORMAL CAMERA AFTER THE MOUNTAIN
    */

    if (
        playerX >= 4000
    ) {

        zoom = 1;

        cameraY = 0;
    }

    /*
        Keep the world anchored to the
        top-left so the camera does not
        create black space.
    */

    world.style.transformOrigin =
        "top left";

    world.style.transform =
        `scale(${zoom})`;

    world.style.left =
        (-cameraX * zoom) + "px";

    world.style.top =
        cameraY + "px";
}
/* ========================= */
/* GAME LOOP */
/* ========================= */

function gameLoop() {

    const oldY =
        playerY;


    /*
        Mountain objects.
    */

    positionMountainFires();

    updateMountainMobs();


    /*
        Horizontal movement.
    */

    let newX =
        playerX;


    if (
        movingLeft
    ) {

        newX -= speed;

    }


    if (
        movingRight
    ) {

        newX += speed;

    }


    if (
        !checkHorizontalCollision(
            newX
        )
    ) {

        playerX =
            newX;

    }


    /*
        Gravity.
    */

    velocityY -= gravity;

    playerY += velocityY;


    /*
        Ground.
    */

    if (
        playerY <= 0
    ) {

        playerY = 0;

        velocityY = 0;

        onGround = true;

    } else {

        onGround = false;

    }


    /*
        Platforms and rocks.
    */

    const landed =
        checkPlatformLanding(
            oldY
        );


    /*
        Mountain.

        This runs AFTER gravity so
        the player gets snapped onto
        the mountain instead of falling
        through it.
    */

    const mountainLanded =
        checkMountainCollision(
            oldY
        );


    if (
        !landed &&
        !mountainLanded &&
        playerY > 0
    ) {

        onGround = false;

    }


    /*
        Mobs.
    */

    checkMobs();

    checkMobAttack();


    /*
        Fire.
    */

    checkFire();


    /*
        World boundaries.
    */

    if (
        playerX < 0
    ) {

        playerX = 0;

    }


    if (
        playerX > 6940
    ) {

        playerX = 6940;

    }


    /*
        Draw player.
    */

    player.style.left =
        playerX + "px";


    player.style.bottom =
        `calc(30vh + ${playerY}px)`;


    /*
        Camera.
    */

    updateCamera();


    requestAnimationFrame(
        gameLoop
    );

}


gameLoop();