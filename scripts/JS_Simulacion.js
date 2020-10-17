
$(document).ready(function () {

    var mouse = { 'x': 0, 'y': 0 };
    $(document).bind('mousemove', function (e) {
        mouse = { 'x': e.pageX, 'y': e.pageY };
    });

    homex = 0;
    homey = 0;
    forcex = 0;
    forcey = 0;
    magnet = 5000;
    mouseSpeed = 1;

    var protonesAtomo = [{'numero':1,'probabilidad':0.0},
                         {'numero':2,'probabilidad':0.3},
                         {'numero':3,'probabilidad':0.3},
                         {'numero':4,'probabilidad':0.4},
                         {'numero':5,'probabilidad':0.0},
                         {'numero':6,'probabilidad':0.0},
                         {'numero':7,'probabilidad':0.0},
                         {'numero':8,'probabilidad':0.0},
                         {'numero':9,'probabilidad':0.0},
                         {'numero':10,'probabilidad':0.0},
                         {'numero':11,'probabilidad':0.0},
                         {'numero':12,'probabilidad':0.0},
                         {'numero':13,'probabilidad':0.0},
                         {'numero':14,'probabilidad':0.0}];

    var carga = 0.5e1;
    var intRangoAtraccion = 5000;
    var catidadAtomos = 7.0e1;
    //var protonesAtomo = [3,6];
    var intCargaMouse = carga*2;
    var relacionElectronesProtones = 1.0;
    var intCargaObjetos = carga; // Debe ser negativa
    var relacionMasa = 1.0e4;
    var masa = 10.0e-2;
    var gravedad = {x:0,y:0.0000}
    var limiteDistancia = 1.0e-10;
    var limiteVelocidad = 7;
    var radioProton = 5;
    var radioElectron = 2;

    var screen = document.getElementById('screen');
    var graphics = screen.getContext('2d');
    var particles = [];

    //Create 20 particles with the following properties
    for (var i = 0; i < catidadAtomos; ++i) {
         var aleatorio = Math.random();
         var s = 0;
         var lastIndex = protonesAtomo.length-1;
         var numero = protonesAtomo[lastIndex].numero;

         for(var k = 0; k < lastIndex; ++k){
             s+=protonesAtomo[k].probabilidad;
             if(aleatorio < s){
                 numero = protonesAtomo[k].numero;
                 break;
             }

         }
        //var aleatorio = Math.floor(protonesAtomo.length*Math.random());
        //var numero = protonesAtomo[aleatorio].numero;
        //var numero = 20;
        particles.push({
            x: screen.width * Math.random(),
            y: screen.height * Math.random(),
            xspeed: 0,
            yspeed: 0,
            xforce: 0,
            yforce: 0,
            //charge: intCargaObjetos,
            //mass: 100,
            //charge: intCargaObjetos * signo * (Math.random()+0.1)/1.1,
            charge: intCargaObjetos * numero,
            mass: masa * relacionMasa * numero,
            radio: radioProton,
            fillStyle: 'hsl(' + parseInt(((k/protonesAtomo.length)*300)+15) + ', 50%, 50%)'
            //fillStyle: 'hsl(' + 360 * Math.random() + ', 50%, 50%)'
        });
        for (var j = 0; j < numero*relacionElectronesProtones; ++j){
            particles.push({
                x: screen.width * Math.random(),
                y: screen.height * Math.random(),
                xspeed: 0,
                yspeed: 0,
                xforce: 0,
                yforce: 0,
                charge: - intCargaObjetos,
                mass: masa,
                radio:radioElectron,
                fillStyle: 'hsl(' + 360 + ', 50%, 50%)'
            });
        }
    }

    setInterval(update, 1000 / 60); //60 frames per second

    function update() {
        try {
            resetforces(); //Set all forces to zero at the beginning of each frame
            applyforces(); //Apply electrostatic forces between particles based on their charge and distance
            updateparticles(); //Update the velocities and positions of each particle
            containparticles(); //Keep the particles inside the screen
            requestAnimationFrame(draw); //Draw the particles
        } catch (e) {
            $("#divLogEventos").append("Error: " + e.message);
        }
    }

    function resetforces() {
        for (var i = 0; i < particles.length; ++i) {
            particles[i].xforce = 0;
            particles[i].yforce = 0;
        }
    }

    function applyforces() {
        for (var i = 0; i < particles.length; ++i) { //For each particle
            for (var j = i + 1; j < particles.length; ++j) { //For each second particle (no repeats)

                var dx = particles[j].x - particles[i].x;
                var dy = particles[j].y - particles[i].y;
                var distance = (Math.sqrt(dx * dx + dy * dy)?Math.sqrt(dx * dx + dy * dy):limiteDistancia);
                var force = -particles[i].charge * particles[j].charge / (distance * distance);

                if (force > 1000) force = 1000; //Make sure the simulation doesn't explode
                //Find the horizontal and vertical components of the force
                var xforce = force * (dx / distance);
                var yforce = force * (dy / distance);
                //Apply forces to particles

                particles[i].xforce += xforce;
                particles[i].yforce += yforce;
                particles[j].xforce -= xforce;
                particles[j].yforce -= yforce;
            }


        //}
        //for (var i = 0; i < particles.length; ++i) { //For each particle
            if ((particles[i].x <= mouse.x + intRangoAtraccion && particles[i].x) >= mouse.x - intRangoAtraccion &&
                    (particles[i].y <= mouse.y + intRangoAtraccion && particles[i].y) >= mouse.y - intRangoAtraccion) {

                var dx = particles[i].x - mouse.x;
                var dy = particles[i].y - mouse.y;

                var distance = (Math.sqrt(dx * dx + dy * dy)?Math.sqrt(dx * dx + dy * dy):limiteDistancia);
                var force = particles[i].charge * intCargaMouse / (distance * distance);

                //if (force > 1000) force = 1000;

                //Find the horizontal and vertical components of the force
                var xforce = force * (dx / distance);
                var yforce = force * (dy / distance);

                //Apply forces to particles
                particles[i].xforce += xforce;
                particles[i].yforce += yforce;

                //$("#divLogEventos").empty();
                //$("#divLogEventos").append("Entra Mouse coordenada X: " + mouse.x + " - " + "Mouse coordenada Y: " + mouse.y + "<br/>");
                //$("#divLogEventos").append("Entra Punto " + i + " coordenada X: " + particles[i].x + " - " + "Punto coordenada Y: " + particles[i].y) + "<br/>";

                //console.log("Aqui estoy");
            }



            //else if (parseInt(particles[i].x) == mouse.x && parseInt(particles[i].y) == mouse.y) {

            //    particles[i].x = mouse.x;
            //    particles[i].y = mouse.y;
            //    particles[i].xspeed = 0;
            //    particles[i].yspeed = 0;
            //    particles[i].xforce = 0;
            //    particles[i].yforce = 0;
            //}


            //$("#divLogEventos").empty();
            //$("#divLogEventos").append("Mouse coordenada X: " + mouse.x + " - " + "Mouse coordenada Y: " + mouse.y + "<br/>");
            //$("#divLogEventos").append("Punto 0 coordenada X: " + parseInt(particles[i].x) + " - " + "Punto coordenada Y: " + parseInt(particles[i].y)) + "<br/><br/>";

            //var sx = particles[i].x <= mouse.x + 10 && parseInt(particles[i].x) >= mouse.x - 10;
            //var sy = particles[i].y <= mouse.y + 10 && parseInt(particles[i].y) >= mouse.y - 10;


            //$("#divLogEventos").append("<br/>Condicion X: " + sx);
            //$("#divLogEventos").append("<br/>Condicion Y: " + sy);

        //}

        //for (var i = 0; i < particles.length; ++i) { //For each particle

                particles[i].xforce += particles[i].mass * gravedad.x;
                particles[i].yforce += particles[i].mass * gravedad.y;

        }



    }

    function updateparticles() {
        for (var i = 0; i < particles.length; ++i) {
            //Update particle velocities
            particles[i].xspeed += particles[i].xforce / particles[i].mass;
            particles[i].yspeed += particles[i].yforce / particles[i].mass;

            //Update particle positions

            /*console.log("Velocidad X: " + particles[i].xspeed);
            console.log("Velocidad Y: " + particles[i].yspeed);*/

            if (particles[i].xspeed > limiteVelocidad) particles[i].xspeed = limiteVelocidad;
            if (particles[i].xspeed < -limiteVelocidad) particles[i].xspeed = -limiteVelocidad;
            if (particles[i].yspeed > limiteVelocidad) particles[i].yspeed = limiteVelocidad;
            if (particles[i].yspeed < -limiteVelocidad) particles[i].yspeed = -limiteVelocidad;

            particles[i].x += particles[i].xspeed;
            particles[i].y += particles[i].yspeed;
        }
    }
    
    function containparticles() {
        for (var i = 0; i < particles.length; ++i) {
            //If particle is to the left of the screen
            if (particles[i].x < 10) {
                particles[i].x = 10;
                //particles[i].xspeed = Math.abs(particles[i].xspeed);
                //particles[i].xspeed = -Math.abs(particles[i].xspeed);
                particles[i].xspeed = -particles[i].xspeed;

            }
            //If particle is above the scren
            if (particles[i].y < 10) {
                particles[i].y = 10;
                //particles[i].yspeed = Math.abs(particles[i].yspeed);
                //particles[i].yspeed = -Math.abs(particles[i].yspeed);
                particles[i].yspeed = -particles[i].yspeed;
            }
            //If particle is to the right of the screen
            if (particles[i].x > screen.width - 10) {
                particles[i].x = screen.width - 10;
                //particles[i].xspeed = -Math.abs(particles[i].xspeed);
                particles[i].xspeed = -particles[i].xspeed;
            }
            //If particle is below the screen
            if (particles[i].y > screen.height - 10) {
                particles[i].y = screen.height - 10;
                //particles[i].yspeed = -Math.abs(particles[i].yspeed);
                particles[i].yspeed = -particles[i].yspeed;
            }
        }
    }

    function draw() {
        //Clear the screen for drawing
        graphics.fillStyle = 'white';
        graphics.fillRect(0, 0, screen.width, screen.height);
        //Draw each particle as a black circles with radius 10

        for (var i = 0; i < particles.length; ++i) {
            graphics.fillStyle = particles[i].fillStyle;
            graphics.beginPath();
            graphics.arc(particles[i].x, particles[i].y, particles[i].radio, 0, 2 * Math.PI);
            graphics.fill();
        }
    }
});