function setup() {
  // Establece la pantalla para que tenga 720 píxeles de ancho y 400 píxeles de alto
  createCanvas(720, 400);
}

function draw() {
  // Establece el fondo a negro y desactiva el color de relleno
  background(0);
  noFill();

  // Los dos parámetros del método point() especifican
  // coordenadas.
  // El primer parámetro es la coordenada x y el segundo es la Y
  stroke(255);
  point(width * 0.5, height * 0.5);
  point(width * 0.5, height * 0.25);

  // Las coordenadas se utilizan para dibujar todas las formas, no solo puntos.
  // Los parámetros para diferentes funciones se utilizan para diferentes
  // propósitos. Por ejemplo, los primeros dos parámetros de line()
  // especifican las coordenadas del primer punto final y el segundo
  // dos parámetros especifican el segundo punto final
  stroke(0, 153, 255);
  line(0, height * 0.33, width, height * 0.33);

  // Por defecto, los primeros dos parámetros para rect() son las
  // coordenadas de la esquina superior izquierda y el segundo par
  // es el ancho y la altura
  stroke(255, 153, 0);
  rect(width * 0.25, height * 0.1, width * 0.5, height * 0.8);
}
