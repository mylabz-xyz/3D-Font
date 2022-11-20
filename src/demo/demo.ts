export class Demo {
  private Zfont = window["Zfont"];
  private Zdog = window["Zdog"];
  private illo!: any;
  // Register Zfont plugin

  constructor() {
    this.Zfont.init(this.Zdog);
    this.init();
    this.animate();
  }

  public init() {
    const textarea = document.getElementById("textarea") as any;

    // create illo
    this.illo = new this.Zdog.Illustration({
      element: ".Canvas",
      dragRotate: true,
      resize: true,
      rotate: { x: -0.32, y: 0.64, z: 0 },
    });

    // create font
    let font = new this.Zdog.Font({
      src: "./fredokaone.ttf",
    });

    let text = new this.Zdog.Text({
      addTo: this.illo,
      font: font,
      value: textarea.value,
      fontSize: 48,
      textAlign: "center",
      textBaseline: "middle",
      color: "#fff",
      fill: true,
    });

    // text "shadow"
    let shadow1 = text.copy({
      addTo: this.illo,
      translate: { z: -3 },
      color: "#aab",
    });
    let shadow2 = text.copy({
      addTo: this.illo,
      translate: { z: -6 },
      color: "#aab",
    });

    textarea.addEventListener("input", function () {
      text.value = textarea.value;
      shadow1.value = textarea.value;
      shadow2.value = textarea.value;
    });
  }

  // animation loop
  animate() {
    this.illo.updateRenderGraph();
    requestAnimationFrame(this.animate.bind(this));
  }
}
new Demo();
