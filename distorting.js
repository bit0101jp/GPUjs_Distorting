  // generate of GPU instance
  gpu = new GPU({mode: "gpu"});

  // Image transfer by GPU kernel
  function imageToArray(image) {
    let kernel1 = gpu.createKernel(function(image) {
        let pixel = image[this.thread.y][this.thread.x];
        this.color(pixel[0], pixel[1], pixel[2], pixel[3]);
    }, {
      output: [image.width, image.height],
      graphical: true,
      pipeline: true
    });

    kernel1(image);
    let imageArray = kernel1.getPixels(true);
    kernel1.destroy();

    return imageArray;
  }

  // Image transformation by GPU kernel
  kernel2 = function(img, dgree) {
    let x = this.thread.x;
    let y = this.thread.y;

    x = Math.floor(x + dgree * Math.sin(y / 20));
    y = Math.floor(y + dgree * Math.sin(x / 20));

    const n = 4 * (x + (this.constants.w * y));
    this.color(img[n] / 256, img[n+1] / 256, img[n+2] / 256, 1);
  };

  // Load image
  image = new Image();
  image.src = 'https://dl.dropbox.com/s/13ldncrc05ru3el/fruits2.jpg?dl=0';
  image.crossOrigin = "anonymous";

  // Transform the image after loading the image
  image.onload = () => {
    const imageArray = imageToArray(image);
    const render = new GPU({mode: "gpu"})
      .createKernel(kernel2)
      .setConstants({ w: image.width, h: image.height })
      .setOutput([image.width, image.height])
      .setGraphical(true);

    const canvas = render.canvas;
    document.body.appendChild(canvas);

    function animation() {
        const speed = 300;
        const dgreeFactor = 20;
        const dgree = dgreeFactor * Math.sin(Date.now() / speed);
        render(imageArray, dgree);

        window.requestAnimationFrame(() => {
            animation();
      });
    }

    animation();
  };
