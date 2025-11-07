uniform float outlineThickness;
uniform vec3 outlineColor;
uniform float opacity;
varying vec3 vNormal;
varying vec3 vViewPosition;

void main() {
    // Calculate the Fresnel term - use abs() to handle both front and back faces
    float fresnelFactor = abs(dot(normalize(vViewPosition), normalize(vNormal)));
    fresnelFactor = 0.5 / max(fresnelFactor, 0.001); // Prevent division by zero
    fresnelFactor = pow(fresnelFactor, outlineThickness);       // Fresnel
    //fresnelFactor = step(0.7, fresnelFactor);                // Outline

    // Set the color of the outline based on the Fresnel term with opacity control
    gl_FragColor = vec4(outlineColor, fresnelFactor * opacity);
}