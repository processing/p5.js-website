# p5.js Example Revision Project 2023

Contributors: Amy Chen, Lance Cole, [Caleb Foss](https://githubb.com/calebfoss) (lead), [Darren Kessner](https://github.com/dkessner), [Kathryn Lichlyter](https://github.com/katlich112358)

This document describes the process for revising the p5.js examples for the 2023 Sovereign Tech Fund project and outlines the structure for the new examples included in this repo.

## Contents

- [Review & Analysis](#review--analysis)
- [Editing Criteria](#editing-criteria)
- [Organizational Structure](#organizational-structure)
- [Preview](#preview)

## Review & Analysis

We reviewed all 190 current examples for the base p5 library (excluding the sound library), as well as the 29 examples revised/written by Malay Vassa for GSoC: [review data](https://docs.google.com/spreadsheets/d/1HJMtTNhSRh-jJM25fSvpKvge65Ee5F93CuB75TNnfM0/edit?usp=sharing). We gathered data to inform both the curation and editing processes.

To maintain wide coverage of the API while curating a smaller list of examples, we analyzed the coverage of different parts of the API: [API coverage data](https://docs.google.com/spreadsheets/d/1XbpgV2pWfUex_C9OYr6WlX_RAOE1Sl4X-4BJiwLWeiA/edit?usp=sharing).

As we selected examples to edit and highlight on the new Examples page, we focused on these two priority areas:

Maximize variety of demonstrations in terms of skill level, area of API, and category (typography, 3D, physics, etc.)
Minimize revision needed for example to be accessible, clear, documented, etc.

## Editing Criteria

We edited the curated p5 examples and wrote additional new examples from scratch using the following criteria:

- Content created follows accessibility guidelines:
  - Content rendered on a canvas includes a screen reader accessible description (via describe(), describeElement(), gridOutput(), or textOutput())
  - Color contrast meets WCAG AA requirements
  - Animations meet WCAG [2.3.1](https://www.w3.org/WAI/WCAG21/Understanding/three-flashes-or-below-threshold.html) and [2.3.3](https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html) requirements
- Readability score of Grade 8 or lower following tools like Hemingway App
- Has an image thumbnail depicting what the example creates
- Named to clearly identify its primary focus
- Includes an introduction paragraph that meets p5’s technical writing guidelines with links to relevant resources (within p5 reference and external like MDN)
- Includes comments that meet [p5’s technical writing guidelines](https://docs.google.com/document/d/1aHyeh9UcKjICippuAvC9iurKfl3RQNHQaj170Ri_7hE/edit?usp=sharing) and help the reader follow the code
- Includes minimal code beyond its primary focus
- Is up-to-date with contemporary JS conventions/syntax and follows [p5's Code Style Guide](https://github.com/processing/p5.js/blob/main/contributor_docs/documentation_style_guide.md#code).
  (let vs var, prototype vs class, etc.)
- Invites remixing by avoiding unnecessary code that causes more fragility with change

## Organizational Structure

The revised examples page will contain 60 examples distributed into 15 categories.

The overall order of examples progresses from beginner to advanced. Someone new to p5 can start from the top and work their way down. The examples introduce a broad range of the API piece by piece. They also introduce programming concepts. Each example builds on what has been introduced so far. We conceptualized this structure as a p5 “story”.

The examples directory in this repo contains a subdirectory for each category with a numbered name to maintain their order.

Each category directory contains a 'More' subdirectory with additional examples related to that category. These are unedited and do not meet all out evaluation criteria. We recommend including them as an optionally revealed section for site visitors who want to explore further variety.

## Preview

### Shapes & Color

|                                                                                                                                                                         |                                                                                                                                        |     |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | --- |
| <a href="examples\01_Shapes_And_Color\00_Shape_Primitives.js"><img src="examples\01_Shapes_And_Color\00_Shape_Primitives.png" height="100" /><br />Shape Primitives</a> | <a href="examples\01_Shapes_And_Color\01_Color.js"><img src="examples\01_Shapes_And_Color\01_Color.png" height="100" /><br />Color</a> |

### Animation & Variables

|                                                                                                                                                                              |                                                                                                                                                                                                      |                                                                                                                                                                                                         |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a href="examples\02_Animation_And_Variables\00_Drawing_Lines.js"><img src="examples\02_Animation_And_Variables\00_Drawing_Lines.png" height="100" /><br />Drawing Lines</a> | <a href="examples\02_Animation_And_Variables\01_Animation_With_Events.js"><img src="examples\02_Animation_And_Variables\01_Animation_With_Events.png" height="100" /><br />Animation With Events</a> | <a href="examples\02_Animation_And_Variables\02_Mobile_Device_Movement.js"><img src="examples\02_Animation_And_Variables\02_Mobile_Device_Movement.jpg" height="100" /><br />Mobile Device Movement</a> |
| <a href="examples\02_Animation_And_Variables\03_Conditions.js"><img src="examples\02_Animation_And_Variables\03_Conditions.png" height="100" /><br />Conditions</a>          |

### Imported Media

|                                                                                                                                                                           |                                                                                                                                                                  |                                                                                                                                                   |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a href="examples\03_Imported_Media\00_Words.js"><img src="examples\03_Imported_Media\00_Words.png" height="100" /><br />Words</a>                                        | <a href="examples\03_Imported_Media\01_Copy_Image_Data.js"><img src="examples\03_Imported_Media\01_Copy_Image_Data.png" height="100" /><br />Copy Image Data</a> | <a href="examples\03_Imported_Media\02_Alpha_Mask.js"><img src="examples\03_Imported_Media\02_Alpha_Mask.png" height="100" /><br />Alpha Mask</a> |
| <a href="examples\03_Imported_Media\03_Image_Transparency.js"><img src="examples\03_Imported_Media\03_Image_Transparency.png" height="100" /><br />Image Transparency</a> | <a href="examples\03_Imported_Media\04_Create_Audio.js"><img src="examples\03_Imported_Media\04_Create_Audio.jpg" width="180" /><br />Create Audio</a>           | <a href="examples\03_Imported_Media\05_Video.js"><img src="examples\03_Imported_Media\05_Video.png" height="100" /><br />Video</a>                |
| <a href="examples\03_Imported_Media\06_Video_Canvas.js"><img src="examples\03_Imported_Media\06_Video_Canvas.png" height="100" /><br />Video Canvas</a>                   | <a href="examples\03_Imported_Media\07_Video_Capture.js"><img src="examples\03_Imported_Media\07_Video_Capture.png" height="100" /><br />Video Capture</a>       |

### Input Elements

|                                                                                                                                                   |                                                                                                                                                         |                                                                                                                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a href="examples\04_Input_Elements\00_Image_Drop.js"><img src="examples\04_Input_Elements\00_Image_Drop.png" height="100" /><br />Image Drop</a> | <a href="examples\04_Input_Elements\01_Input_Button.js"><img src="examples\04_Input_Elements\01_Input_Button.png" height="100" /><br />Input Button</a> | <a href="examples\04_Input_Elements\02_DOM_Form_Elements.js"><img src="examples\04_Input_Elements\02_DOM_Form_Elements.png" height="100" /><br />DOM Form Elements</a> |

### Transformation

|                                                                                                                                                |                                                                                                                                       |                                                                                                                                    |
| ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| <a href="examples\05_Transformation\00_Translate.js"><img src="examples\05_Transformation\00_Translate.png" height="100" /><br />Translate</a> | <a href="examples\05_Transformation\01_Rotate.js"><img src="examples\05_Transformation\01_Rotate.png" height="100" /><br />Rotate</a> | <a href="examples\05_Transformation\02_Scale.js"><img src="examples\05_Transformation\02_Scale.png" height="100" /><br />Scale</a> |

### Calculating Values

|                                                                                                                                                              |                                                                                                                                            |                                                                                                                                               |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| <a href="examples\06_Calculating_Values\00_Interpolate.js"><img src="examples\06_Calculating_Values\00_Interpolate.png" height="100" /><br />Interpolate</a> | <a href="examples\06_Calculating_Values\01_Map.js"><img src="examples\06_Calculating_Values\01_Map.png" height="100" /><br />Map</a>       | <a href="examples\06_Calculating_Values\02_Random.js"><img src="examples\06_Calculating_Values\02_Random.png" height="100" /><br />Random</a> |
| <a href="examples\06_Calculating_Values\03_Constrain.js"><img src="examples\06_Calculating_Values\03_Constrain.png" height="100" /><br />Constrain</a>       | <a href="examples\06_Calculating_Values\04_Clock.js"><img src="examples\06_Calculating_Values\04_Clock.png" height="100" /><br />Clock</a> |

### Repetition

|                                                                                                                                                                      |                                                                                                                                              |                                                                                                                                                       |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a href="examples\07_Repetition\00_Color_Interpolation.js"><img src="examples\07_Repetition\00_Color_Interpolation.png" height="100" /><br />Color Interpolation</a> | <a href="examples\07_Repetition\01_Color_Wheel.js"><img src="examples\07_Repetition\01_Color_Wheel.png" height="100" /><br />Color Wheel</a> | <a href="examples\07_Repetition\02_Bezier.js"><img src="examples\07_Repetition\02_Bezier.png" height="100" /><br />Bezier</a>                         |
| <a href="examples\07_Repetition\03_Kaleidoscope.js"><img src="examples\07_Repetition\03_Kaleidoscope.png" height="100" /><br />Kaleidoscope</a>                      | <a href="examples\07_Repetition\04_Noise.js"><img src="examples\07_Repetition\04_Noise.png" height="100" /><br />Noise</a>                   | <a href="examples\07_Repetition\05_Recursive_Tree.js"><img src="examples\07_Repetition\05_Recursive_Tree.png" height="100" /><br />Recursive Tree</a> |

### Listing Data with Arrays

|                                                                                                                                                                                |     |     |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --- | --- |
| <a href="examples\08_Listing_Data_with_Arrays\00_Random_Poetry.js"><img src="examples\08_Listing_Data_with_Arrays\00_Random_Poetry.png" height="100" /><br />Random Poetry</a> |

### Angles & Motion

|                                                                                                                                                            |                                                                                                                                    |                                                                                                                                                                     |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a href="examples\09_Angles_And_Motion\00_Sine_Cosine.js"><img src="examples\09_Angles_And_Motion\00_Sine_Cosine.png" height="100" /><br />Sine Cosine</a> | <a href="examples\09_Angles_And_Motion\01_Aim.js"><img src="examples\09_Angles_And_Motion\01_Aim.png" height="100" /><br />Aim</a> | <a href="examples\09_Angles_And_Motion\02_Triangle_Strip.js"><img src="examples\09_Angles_And_Motion\02_Triangle_Strip.png" height="100" /><br />Triangle Strip</a> |

### Games

|                                                                                                                                             |                                                                                                                              |                                                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| <a href="examples\10_Games\00_Circle_Clicker.js"><img src="examples\10_Games\00_Circle_Clicker.png" height="100" /><br />Circle Clicker</a> | <a href="examples\10_Games\01_Ping_Pong.js"><img src="examples\10_Games\01_Ping_Pong.png" height="100" /><br />Ping Pong</a> | <a href="examples\10_Games\02_Snake.js"><img src="examples\10_Games\02_Snake.png" height="100" /><br />Snake</a> |

### 3D

|                                                                                                                                             |                                                                                                                                          |                                                                                                                                                                                                |
| ------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a href="examples\11_3D\00_Geometries.js"><img src="examples\11_3D\00_Geometries.png" height="100" /><br />Geometries</a>                   | <a href="examples\11_3D\01_Custom_Geometry.js"><img src="examples\11_3D\01_Custom_Geometry.png" height="100" /><br />Custom Geometry</a> | <a href="examples\11_3D\02_Materials.js"><img src="examples\11_3D\02_Materials.png" height="100" /><br />Materials</a>                                                                         |
| <a href="examples\11_3D\03_Orbit_Control.js"><img src="examples\11_3D\03_Orbit_Control.png" height="100" /><br />Orbit Control</a>          | <a href="examples\11_3D\04_Filter_Shader.js"><img src="examples\11_3D\04_Filter_Shader.png" height="100" /><br />Filter Shader</a>       | <a href="examples\11_3D\05_Adjusting_Positions_With_A_Shader.js"><img src="examples\11_3D\05_Adjusting_Positions_With_A_Shader.png" height="100" /><br />Adjusting Positions With A Shader</a> |
| <a href="examples\11_3D\06_Framebuffer_Blur.js"><img src="examples\11_3D\06_Framebuffer_Blur.png" height="100" /><br />Framebuffer Blur</a> |

### Advanced Canvas Rendering

|                                                                                                                                                                                        |                                                                                                                                                                                              |                                                                                                                                                                                                    |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a href="examples\12_Advanced_Canvas_Rendering\00_Create_Graphics.js"><img src="examples\12_Advanced_Canvas_Rendering\00_Create_Graphics.png" height="100" /><br />Create Graphics</a> | <a href="examples\12_Advanced_Canvas_Rendering\01_Multiple_Canvases.js"><img src="examples\12_Advanced_Canvas_Rendering\01_Multiple_Canvases.png" height="100" /><br />Multiple Canvases</a> | <a href="examples\12_Advanced_Canvas_Rendering\02_Shader_As_A_Texture.js"><img src="examples\12_Advanced_Canvas_Rendering\02_Shader_As_A_Texture.png" height="100" /><br />Shader As A Texture</a> |

### Classes & Objects

|                                                                                                                                                             |                                                                                                                                                                                  |                                                                                                                                                                                        |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a href="examples\13_Classes_And_Objects\00_Snowflakes.js"><img src="examples\13_Classes_And_Objects\00_Snowflakes.png" height="100" /><br />Snowflakes</a> | <a href="examples\13_Classes_And_Objects\01_Shake_Ball_Bounce.js"><img src="examples\13_Classes_And_Objects\01_Shake_Ball_Bounce.png" height="100" /><br />Shake Ball Bounce</a> | <a href="examples\13_Classes_And_Objects\02_Connected_Particles.js"><img src="examples\13_Classes_And_Objects\02_Connected_Particles.png" height="100" /><br />Connected Particles</a> |
| <a href="examples\13_Classes_And_Objects\03_Flocking.js"><img src="examples\13_Classes_And_Objects\03_Flocking.png" height="100" /><br />Flocking</a>       |

### Loading & Saving Data

|                                                                                                                                                                                          |                                                                                                                                                                                 |                                                                                                                                                                                       |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a href="examples\14_Loading_And_Saving_Data\00_Load_Save_Storage.js"><img src="examples\14_Loading_And_Saving_Data\00_Load_Save_Storage.png" height="100" /><br />Load Save Storage</a> | <a href="examples\14_Loading_And_Saving_Data\01_Load_Save_JSON.js"><img src="examples\14_Loading_And_Saving_Data\01_Load_Save_JSON.png" height="100" /><br />Load Save JSON</a> | <a href="examples\14_Loading_And_Saving_Data\02_Load_Saved_Table.js"><img src="examples\14_Loading_And_Saving_Data\02_Load_Saved_Table.png" height="100" /><br />Load Saved Table</a> |

### Math & Physics

|                                                                                                                                                                                                    |                                                                                                                                                             |                                                                                                                                                       |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a href="examples\15_Math_And_Physics\00_Non_Orthogonal_Reflection.js"><img src="examples\15_Math_And_Physics\00_Non_Orthogonal_Reflection.png" height="100" /><br />Non Orthogonal Reflection</a> | <a href="examples\15_Math_And_Physics\01_Soft_Body.js"><img src="examples\15_Math_And_Physics\01_Soft_Body.png" height="100" /><br />Soft Body</a>          | <a href="examples\15_Math_And_Physics\02_Forces.js"><img src="examples\15_Math_And_Physics\02_Forces.png" height="100" /><br />Forces</a>             |
| <a href="examples\15_Math_And_Physics\03_Smoke_Particle_System.js"><img src="examples\15_Math_And_Physics\03_Smoke_Particle_System.png" height="100" /><br />Smoke Particle System</a>             | <a href="examples\15_Math_And_Physics\04_Game_Of_Life.js"><img src="examples\15_Math_And_Physics\04_Game_Of_Life.png" height="100" /><br />Game Of Life</a> | <a href="examples\15_Math_And_Physics\05_Mandelbrot.js"><img src="examples\15_Math_And_Physics\05_Mandelbrot.png" height="100" /><br />Mandelbrot</a> |
