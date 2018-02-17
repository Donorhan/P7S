/**
 * Particles structure
 */
var particles = {
    position : [0.0, 0.0],
    velocity : [0.0, 0.0],
    size     : 0.0
};

/**
 * Simulation data
 */
var simulation = {
    pi2       : Math.PI * 2,
    time      : 0,
    context   : null,
    size      : [],
    particles : [],
    settings  : {
        fullscreen : true,
        gravity    : 0,
        count      : 100,
        color      : [255, 255, 255],
        size       : [3, 5],
        proximity  : [250, 100]
    }
};

/**
 * Get a random value in the specified range
 *
 * @param min Minimun value [included]
 * @param max Maximun value [excluded]
 */
function getRandomValue(min, max)
{
    return Math.random() * (max - min) + min;
}


/**
 * Add particles
 *
 * @param amount Amount of particles to add
 */
function addParticles(amount)
{
    for (var i = 0; i < amount; i++) 
    {
        var particle = {
            position : [0.0, 0.0], 
            velocity : [0.0, 0.0]
        };

        particle.position = [getRandomValue(0, simulation.size[0]), 
                             getRandomValue(0, simulation.size[1])];

        particle.velocity = [getRandomValue(-0.035, 0.035), 
                             getRandomValue(-0.035, 0.035)];

        particle.size = getRandomValue(simulation.settings.size[0], simulation.settings.size[1]);

        simulation.particles.push(particle);
    }
}

/**
 * Entry point
 */
function run()
{
    requestAnimationFrame(run);

    // Compute delta time
    var now = new Date().getTime();
    var dt = now - (simulation.time || now);
    simulation.time = now;

    // We can work now
    if (document.hasFocus()) {
        update(dt);
        draw(dt);        
    }
}

/**
 * Draw the simulation
 *
 * @param dt Delta time
 */
function draw(dt)
{
    simulation.context.clearRect(0, 0, simulation.size[0], simulation.size[1]);
    drawParticles();
    drawJoints();
}

/**
 * Update the simulation
 *
 * @param dt Delta time
 */
function update(dt)
{
    // Update positions
    for (var i = 0; i < simulation.particles.length; i++) {
        simulation.particles[i].position[0] += simulation.particles[i].velocity[0] * dt;
        simulation.particles[i].position[1] += simulation.particles[i].velocity[1] * dt;
    }

    // Add gravity
    if (simulation.settings.gravity) {
        for (var i = 0; i < simulation.particles.length; i++) {
            simulation.particles[i].velocity[1] += simulation.settings.gravity * dt;
        }
    }

    // Set limits
    for (var i = 0; i < simulation.particles.length; i++) {
        for (var j = 0; j <= 1; j++) {
            if (simulation.particles[i].position[j] <= 0) {
                simulation.particles[i].velocity[j] = Math.abs(simulation.particles[i].velocity[j]);
                simulation.particles[i].position[j] = 1;
            }
            else if (simulation.particles[i].position[j] >= simulation.size[j]) {
                simulation.particles[i].velocity[j] = -Math.abs(simulation.particles[i].velocity[j]);
                simulation.particles[i].position[j] = simulation.size[j] - 1;
            }
        }
    }
}

function drawParticles()
{
    simulation.context.fillStyle = 'rgba(' + simulation.settings.color[0] + ', ' + simulation.settings.color[1] + ', ' + simulation.settings.color[2] + ', 1.0)';
        
    for (var i = 0; i < simulation.particles.length; i++) 
    {
        var p1 = simulation.particles[i].position;

        simulation.context.beginPath();
        simulation.context.arc((0.5 + p1[0]) << 0, (0.5 + p1[1]) << 0, simulation.particles[i].size * 0.5, 0, simulation.pi2, true);
        simulation.context.closePath();
        simulation.context.fill();
    }
}

function drawJoints()
{
    var particlesCount = simulation.particles.length;
    for (var i = 0; i < particlesCount; i++) 
    {
        var p1 = simulation.particles[i].position;
        
        // Draw joints
        for (var j = i + 1; j < particlesCount; j++) 
        {
            // Easier to manipulate
            var p2 = simulation.particles[j].position;

            // Pythagorus theorum to get distance between two points
            var a = p1[0] - p2[0];
            var b = p1[1] - p2[1];
            var dist = Math.sqrt((a * a) + (b * b));

            if (dist < simulation.settings.proximity[0]) {
                // Set apparence
                var opacity = 1.0 - (dist / simulation.settings.proximity[1]);
                opacity = Math.min(opacity, 0.6);
                simulation.context.strokeStyle = 'rgba(' + simulation.settings.color[0] + ', ' + simulation.settings.color[1] + ', ' + simulation.settings.color[2] + ', ' + opacity + ')';

                // Draw
                simulation.context.beginPath();
                simulation.context.moveTo((0.5 + p1[0]) << 0, (0.5 + p1[1]) << 0);
                simulation.context.lineTo((0.5 + p2[0]) << 0, (0.5 + p2[1]) << 0);
                simulation.context.closePath();
                simulation.context.stroke();
            }
        }
    }
}

/**
 * On load
 */
function init() 
{
    var canvas  = document.getElementById('header');
    if (canvas.getContext) 
    {
        // Full screen
        if (simulation.settings.fullscreen) {
            canvas.width  = document.body.clientWidth;
            canvas.height = document.body.clientHeight;            
        }

        var context = canvas.getContext('2d', { alpha: false });
        simulation.size[0] = canvas.width;
        simulation.size[1] = canvas.height;
        simulation.context = context;

        // Init and run
        addParticles(simulation.settings.count);
        run();
    }
}
