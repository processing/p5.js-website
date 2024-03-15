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
| <a href="examples\01_Shapes_And_Color\00_Shape_Primitives\code.js"><img src="examples\01_Shapes_And_Color\00_Shape_Primitives\thumbnail.png" height="100" /><br />Shape Primitives</a> | <a href="examples\01_Shapes_And_Color\01_Color\code.js"><img src="examples\01_Shapes_And_Color\01_Color\thumbnail.png" height="100" /><br />Color</a> |

### Animation & Variables

|                                                                                                                                                                              |                                                                                                                                                                                                      |                                                                                                                                                                                                         |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a href="examples\02_Animation_And_Variables\00_Drawing_Lines\code.js"><img src="examples\02_Animation_And_Variables\00_Drawing_Lines\thumbnail.png" height="100" /><br />Drawing Lines</a> | <a href="examples\02_Animation_And_Variables\01_Animation_With_Events\code.js"><img src="examples\02_Animation_And_Variables\01_Animation_With_Events\thumbnail.png" height="100" /><br />Animation With Events</a> | <a href="examples\02_Animation_And_Variables\02_Mobile_Device_Movement\code.js"><img src="examples\02_Animation_And_Variables\02_Mobile_Device_Movement\thumbnail.jpg" height="100" /><br />Mobile Device Movement</a> |
| <a href="examples\02_Animation_And_Variables\03_Conditions\code.js"><img src="examples\02_Animation_And_Variables\03_Conditions\thumbnail.png" height="100" /><br />Conditions</a>          |

### Imported Media

|                                                                                                                                                                           |                                                                                                                                                                  |                                                                                                                                                   |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a href="examples\03_Imported_Media\00_Words\code.js"><img src="examples\03_Imported_Media\00_Words\thumbnail.png" height="100" /><br />Words</a>                                        | <a href="examples\03_Imported_Media\01_Copy_Image_Data\code.js"><img src="examples\03_Imported_Media\01_Copy_Image_Data\thumbnail.png" height="100" /><br />Copy Image Data</a> | <a href="examples\03_Imported_Media\02_Alpha_Mask\code.js"><img src="examples\03_Imported_Media\02_Alpha_Mask\thumbnail.png" height="100" /><br />Alpha Mask</a> |
| <a href="examples\03_Imported_Media\03_Image_Transparency\code.js"><img src="examples\03_Imported_Media\03_Image_Transparency\thumbnail.png" height="100" /><br />Image Transparency</a> | <a href="examples\03_Imported_Media\04_Create_Audio\code.js"><img src="examples\03_Imported_Media\04_Create_Audio\thumbnail.jpg" width="180" /><br />Create Audio</a>           | <a href="examples\03_Imported_Media\05_Video\code.js"><img src="examples\03_Imported_Media\05_Video\thumbnail.png" height="100" /><br />Video</a>                |
| <a href="examples\03_Imported_Media\06_Video_Canvas\code.js"><img src="examples\03_Imported_Media\06_Video_Canvas\thumbnail.png" height="100" /><br />Video Canvas</a>                   | <a href="examples\03_Imported_Media\07_Video_Capture\code.js"><img src="examples\03_Imported_Media\07_Video_Capture\thumbnail.png" height="100" /><br />Video Capture</a>       |

### Input Elements

|                                                                                                                                                   |                                                                                                                                                         |                                                                                                                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a href="examples\04_Input_Elements\00_Image_Drop\code.js"><img src="examples\04_Input_Elements\00_Image_Drop\thumbnail.png" height="100" /><br />Image Drop</a> | <a href="examples\04_Input_Elements\01_Input_Button\code.js"><img src="examples\04_Input_Elements\01_Input_Button\thumbnail.png" height="100" /><br />Input Button</a> | <a href="examples\04_Input_Elements\02_DOM_Form_Elements\code.js"><img src="examples\04_Input_Elements\02_DOM_Form_Elements\thumbnail.png" height="100" /><br />DOM Form Elements</a> |

### Transformation

|                                                                                                                                                |                                                                                                                                       |                                                                                                                                    |
| ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| <a href="examples\05_Transformation\00_Translate\code.js"><img src="examples\05_Transformation\00_Translate\thumbnail.png" height="100" /><br />Translate</a> | <a href="examples\05_Transformation\01_Rotate\code.js"><img src="examples\05_Transformation\01_Rotate\thumbnail.png" height="100" /><br />Rotate</a> | <a href="examples\05_Transformation\02_Scale\code.js"><img src="examples\05_Transformation\02_Scale\thumbnail.png" height="100" /><br />Scale</a> |

### Calculating Values

|                                                                                                                                                              |                                                                                                                                            |                                                                                                                                               |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| <a href="examples\06_Calculating_Values\00_Interpolate\code.js"><img src="examples\06_Calculating_Values\00_Interpolate\thumbnail.png" height="100" /><br />Interpolate</a> | <a href="examples\06_Calculating_Values\01_Map\code.js"><img src="examples\06_Calculating_Values\01_Map\thumbnail.png" height="100" /><br />Map</a>       | <a href="examples\06_Calculating_Values\02_Random\code.js"><img src="examples\06_Calculating_Values\02_Random\thumbnail.png" height="100" /><br />Random</a> |
| <a href="examples\06_Calculating_Values\03_Constrain\code.js"><img src="examples\06_Calculating_Values\03_Constrain\thumbnail.png" height="100" /><br />Constrain</a>       | <a href="examples\06_Calculating_Values\04_Clock\code.js"><img src="examples\06_Calculating_Values\04_Clock\thumbnail.png" height="100" /><br />Clock</a> |

### Repetition

|                                                                                                                                                                      |                                                                                                                                              |                                                                                                                                                       |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a href="examples\07_Repetition\00_Color_Interpolation\code.js"><img src="examples\07_Repetition\00_Color_Interpolation\thumbnail.png" height="100" /><br />Color Interpolation</a> | <a href="examples\07_Repetition\01_Color_Wheel\code.js"><img src="examples\07_Repetition\01_Color_Wheel\thumbnail.png" height="100" /><br />Color Wheel</a> | <a href="examples\07_Repetition\02_Bezier\code.js"><img src="examples\07_Repetition\02_Bezier\thumbnail.png" height="100" /><br />Bezier</a>                         |
| <a href="examples\07_Repetition\03_Kaleidoscope\code.js"><img src="examples\07_Repetition\03_Kaleidoscope\thumbnail.png" height="100" /><br />Kaleidoscope</a>                      | <a href="examples\07_Repetition\04_Noise\code.js"><img src="examples\07_Repetition\04_Noise\thumbnail.png" height="100" /><br />Noise</a>                   | <a href="examples\07_Repetition\05_Recursive_Tree\code.js"><img src="examples\07_Repetition\05_Recursive_Tree\thumbnail.png" height="100" /><br />Recursive Tree</a> |

### Listing Data with Arrays

|                                                                                                                                                                                |     |     |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --- | --- |
| <a href="examples\08_Listing_Data_with_Arrays\00_Random_Poetry\code.js"><img src="examples\08_Listing_Data_with_Arrays\00_Random_Poetry\thumbnail.png" height="100" /><br />Random Poetry</a> |

### Angles & Motion

|                                                                                                                                                            |                                                                                                                                    |                                                                                                                                                                     |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a href="examples\09_Angles_And_Motion\00_Sine_Cosine\code.js"><img src="examples\09_Angles_And_Motion\00_Sine_Cosine\thumbnail.png" height="100" /><br />Sine Cosine</a> | <a href="examples\09_Angles_And_Motion\01_Aim\code.js"><img src="examples\09_Angles_And_Motion\01_Aim\thumbnail.png" height="100" /><br />Aim</a> | <a href="examples\09_Angles_And_Motion\02_Triangle_Strip\code.js"><img src="examples\09_Angles_And_Motion\02_Triangle_Strip\thumbnail.png" height="100" /><br />Triangle Strip</a> |

### Games

|                                                                                                                                             |                                                                                                                              |                                                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| <a href="examples\10_Games\00_Circle_Clicker\code.js"><img src="examples\10_Games\00_Circle_Clicker\thumbnail.png" height="100" /><br />Circle Clicker</a> | <a href="examples\10_Games\01_Ping_Pong\code.js"><img src="examples\10_Games\01_Ping_Pong\thumbnail.png" height="100" /><br />Ping Pong</a> | <a href="examples\10_Games\02_Snake\code.js"><img src="examples\10_Games\02_Snake\thumbnail.png" height="100" /><br />Snake</a> |

### 3D

|                                                                                                                                             |                                                                                                                                          |                                                                                                                                                                                                |
| ------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a href="examples\11_3D\00_Geometries\code.js"><img src="examples\11_3D\00_Geometries\thumbnail.png" height="100" /><br />Geometries</a>                   | <a href="examples\11_3D\01_Custom_Geometry\code.js"><img src="examples\11_3D\01_Custom_Geometry\thumbnail.png" height="100" /><br />Custom Geometry</a> | <a href="examples\11_3D\02_Materials\code.js"><img src="examples\11_3D\02_Materials\thumbnail.png" height="100" /><br />Materials</a>                                                                         |
| <a href="examples\11_3D\03_Orbit_Control\code.js"><img src="examples\11_3D\03_Orbit_Control\thumbnail.png" height="100" /><br />Orbit Control</a>          | <a href="examples\11_3D\04_Filter_Shader\code.js"><img src="examples\11_3D\04_Filter_Shader\thumbnail.png" height="100" /><br />Filter Shader</a>       | <a href="examples\11_3D\05_Adjusting_Positions_With_A_Shader\code.js"><img src="examples\11_3D\05_Adjusting_Positions_With_A_Shader\thumbnail.png" height="100" /><br />Adjusting Positions With A Shader</a> |
| <a href="examples\11_3D\06_Framebuffer_Blur\code.js"><img src="examples\11_3D\06_Framebuffer_Blur\thumbnail.png" height="100" /><br />Framebuffer Blur</a> |

### Advanced Canvas Rendering

|                                                                                                                                                                                        |                                                                                                                                                                                              |                                                                                                                                                                                                    |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a href="examples\12_Advanced_Canvas_Rendering\00_Create_Graphics\code.js"><img src="examples\12_Advanced_Canvas_Rendering\00_Create_Graphics\thumbnail.png" height="100" /><br />Create Graphics</a> | <a href="examples\12_Advanced_Canvas_Rendering\01_Multiple_Canvases\code.js"><img src="examples\12_Advanced_Canvas_Rendering\01_Multiple_Canvases\thumbnail.png" height="100" /><br />Multiple Canvases</a> | <a href="examples\12_Advanced_Canvas_Rendering\02_Shader_As_A_Texture\code.js"><img src="examples\12_Advanced_Canvas_Rendering\02_Shader_As_A_Texture\thumbnail.png" height="100" /><br />Shader As A Texture</a> |

### Classes & Objects

|                                                                                                                                                             |                                                                                                                                                                                  |                                                                                                                                                                                        |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a href="examples\13_Classes_And_Objects\00_Snowflakes\code.js"><img src="examples\13_Classes_And_Objects\00_Snowflakes\thumbnail.png" height="100" /><br />Snowflakes</a> | <a href="examples\13_Classes_And_Objects\01_Shake_Ball_Bounce\code.js"><img src="examples\13_Classes_And_Objects\01_Shake_Ball_Bounce\thumbnail.png" height="100" /><br />Shake Ball Bounce</a> | <a href="examples\13_Classes_And_Objects\02_Connected_Particles\code.js"><img src="examples\13_Classes_And_Objects\02_Connected_Particles\thumbnail.png" height="100" /><br />Connected Particles</a> |
| <a href="examples\13_Classes_And_Objects\03_Flocking\code.js"><img src="examples\13_Classes_And_Objects\03_Flocking\thumbnail.png" height="100" /><br />Flocking</a>       |

### Loading & Saving Data

|                                                                                                                                                                                          |                                                                                                                                                                                 |                                                                                                                                                                                       |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a href="examples\14_Loading_And_Saving_Data\00_Local_Storage\code.js"><img src="examples\14_Loading_And_Saving_Data\00_Local_Storage\thumbnail.png" height="100" /><br />Load Save Storage</a> | <a href="examples\14_Loading_And_Saving_Data\01_JSON\code.js"><img src="examples\14_Loading_And_Saving_Data\01_JSON\thumbnail.png" height="100" /><br />Load Save JSON</a> | <a href="examples\14_Loading_And_Saving_Data\02_Table\code.js"><img src="examples\14_Loading_And_Saving_Data\02_Table\thumbnail.png" height="100" /><br />Load Saved Table</a> |

### Math & Physics

|                                                                                                                                                                                                    |                                                                                                                                                             |                                                                                                                                                       |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a href="examples\15_Math_And_Physics\00_Non_Orthogonal_Reflection\code.js"><img src="examples\15_Math_And_Physics\00_Non_Orthogonal_Reflection\thumbnail.png" height="100" /><br />Non Orthogonal Reflection</a> | <a href="examples\15_Math_And_Physics\01_Soft_Body\code.js"><img src="examples\15_Math_And_Physics\01_Soft_Body\thumbnail.png" height="100" /><br />Soft Body</a>          | <a href="examples\15_Math_And_Physics\02_Forces\code.js"><img src="examples\15_Math_And_Physics\02_Forces\thumbnail.png" height="100" /><br />Forces</a>             |
| <a href="examples\15_Math_And_Physics\03_Smoke_Particle_System\code.js"><img src="examples\15_Math_And_Physics\03_Smoke_Particle_System\thumbnail.png" height="100" /><br />Smoke Particle System</a>             | <a href="examples\15_Math_And_Physics\04_Game_Of_Life\code.js"><img src="examples\15_Math_And_Physics\04_Game_Of_Life\thumbnail.png" height="100" /><br />Game Of Life</a> | <a href="examples\15_Math_And_Physics\05_Mandelbrot\code.js"><img src="examples\15_Math_And_Physics\05_Mandelbrot\thumbnail.png" height="100" /><br />Mandelbrot</a> |
