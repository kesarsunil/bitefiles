import { useEffect, useRef } from 'react';

export const WebGLBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl');
    if (!gl) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Vertex shader
    const vertexShaderSource = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    // Fragment shader with cyberpunk animated gradient
    const fragmentShaderSource = `
      precision mediump float;
      uniform float time;
      uniform vec2 resolution;

      // Noise function
      float noise(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
      }

      float smoothNoise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        
        float a = noise(i);
        float b = noise(i + vec2(1.0, 0.0));
        float c = noise(i + vec2(0.0, 1.0));
        float d = noise(i + vec2(1.0, 1.0));
        
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }

      float fbm(vec2 p) {
        float value = 0.0;
        float amplitude = 0.5;
        float frequency = 2.0;
        
        for(int i = 0; i < 6; i++) {
          value += amplitude * smoothNoise(p * frequency);
          frequency *= 2.0;
          amplitude *= 0.5;
        }
        return value;
      }

      // Create digital rain effect
      float digitalRain(vec2 uv, float time) {
        float col = fract(sin(floor(uv.x * 50.0)) * 43758.5453);
        float rain = fract(col + time * 0.3);
        return step(0.98, rain) * step(uv.y, rain);
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / resolution;
        
        // Animated coordinates for flowing energy
        vec2 p = uv * 4.0;
        p.x += time * 0.15;
        p.y += sin(time * 0.3 + uv.x * 3.0) * 0.3;
        
        // Create flowing cyberpunk pattern
        float n1 = fbm(p + time * 0.08);
        float n2 = fbm(p * 1.5 - time * 0.1);
        
        // Black and White color palette
        vec3 pureBlack = vec3(0.0, 0.0, 0.0); // #000000
        vec3 darkGray = vec3(0.05, 0.05, 0.05);
        vec3 white = vec3(1.0, 1.0, 1.0); // #ffffff
        vec3 lightGray = vec3(0.8, 0.8, 0.8); // #cccccc
        
        // Mix colors based on noise - mostly black with white energy
        vec3 baseColor = mix(pureBlack, darkGray, n1 * 0.3);
        
        // Add white energy streams
        float whiteStreams = smoothstep(0.6, 0.8, n1) * 0.25;
        baseColor = mix(baseColor, white, whiteStreams);
        
        // Add gray highlights
        float grayHighlights = smoothstep(0.7, 0.9, n2) * 0.15;
        baseColor = mix(baseColor, lightGray, grayHighlights);
        
        // Add vertical scan lines
        float scanline = sin(uv.y * resolution.y * 2.0) * 0.02;
        baseColor += scanline;
        
        // Add digital rain effect
        float rain = digitalRain(uv, time);
        baseColor += rain * neonCyan * 0.6;
        
        // Add pulsing energy waves
        float pulse = sin(time * 2.0 + length(uv - 0.5) * 10.0) * 0.5 + 0.5;
        float energyWave = smoothstep(0.8, 1.0, pulse) * 0.15;
        baseColor += energyWave * neonBlue;
        
        // Vignette effect
        float vignette = 1.0 - length(uv - 0.5) * 0.8;
        baseColor *= vignette;
        
        gl_FragColor = vec4(baseColor, 1.0);
      }
    `;

    // Compile shader
    function compileShader(source: string, type: number) {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    }

    const vertexShader = compileShader(vertexShaderSource, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER);

    if (!vertexShader || !fragmentShader) return;

    // Create program
    const program = gl.createProgram();
    if (!program) return;

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    // Set up geometry
    const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Get uniform locations
    const timeLocation = gl.getUniformLocation(program, 'time');
    const resolutionLocation = gl.getUniformLocation(program, 'resolution');

    // Animation loop
    let startTime = Date.now();
    let animationId: number;

    const render = () => {
      const time = (Date.now() - startTime) * 0.001;

      gl.uniform1f(timeLocation, time);
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationId = requestAnimationFrame(render);
    };

    render();

    // Handle resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
      style={{ mixBlendMode: 'normal' }}
    />
  );
};
