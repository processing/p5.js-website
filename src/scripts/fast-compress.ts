import fg from "fast-glob";
import { join, extname } from "node:path";
import sharp from "sharp";
import { writeFile, readFile } from 'node:fs/promises';
import { minify } from '@swc/html';
import { optimize } from 'svgo';
import logUpdate from 'log-update';

export default () => {
	return {
		name: "fast-compress",
		hooks: {
			"astro:build:done": async ({dir}: any) => {
				const dirPath = dir.pathname;
				const files = await fg(join(dirPath, "**/*.(webp|gif|jpg|jpeg|png|html|svg)"));
				let processing = 0;
				let writing = 0;
				let total = 0;


				function logMessage(){
					const processingProgress = 1 - (processing/total);
					const writingProgress = 1 - (writing/total);
					const processingBar = `[${'='.repeat(Math.round(processingProgress * 20))}${' '.repeat(20 - Math.round(processingProgress * 20))}]`;
					const writingBar = `[${'='.repeat(Math.round(writingProgress * 20))}${' '.repeat(20 - Math.round(writingProgress * 20))}]`;

					logUpdate(
`
Processing ${processingBar} ${Math.floor(processingProgress * 100)}% (${total - processing}/${total})
Writing    ${writingBar} ${Math.floor(writingProgress * 100)}% (${total - writing}/${total})
`
					);
				}

				const promises = files.map(async (file) => {
					if(extname(file) === ".webp"){
						const data = await sharp(file, {animated: true})
							.webp({
								effort: 6
							})
							.toBuffer();

						processing--;
						logMessage();
						await writeFile(file, data);
						writing--;
						logMessage();

					} else if(extname(file) === ".gif") {
						const data = await sharp(file, {animated: true})
							.gif({
								effort: 10
							})
							.toBuffer();

						processing--;
						logMessage();
						await writeFile(file, data);
						writing--;
						logMessage();

					} else if(extname(file) === ".jpg" || extname(file) === ".jpeg") {
						const data = await sharp(file)
							.jpeg({
							})
							.toBuffer();

						processing--;
						logMessage();
						await writeFile(file, data);
						writing--;
						logMessage();

					} else if(extname(file) === ".png") {
						const data = await sharp(file)
							.png({
								compressionLevel: 9,
								effort: 10
							})
							.toBuffer();

						processing--;
						logMessage();
						await writeFile(file, data);
						writing--;
						logMessage();

					} else if(extname(file) === ".html") {
						const text = await readFile(file, {encoding: "utf8"});

						try{
							const data = await minify(text, {
								collapseWhitespaces: "smart",
								removeComments: true,
								sortAttributes: true
							});

							processing--;
							logMessage();
							await writeFile(file, data.code);
							writing--;
							logMessage();

						}catch(err){
							console.warn(err);
						}

					} else if(extname(file) === ".svg") {
						const text = await readFile(file, {encoding: "utf8"});

						const {data} = optimize(text, {
							path: file,
							multipass: true,
							js2svg: {
								indent: 0,
								pretty: false,
							},
							plugins: ["preset-default"],
						})
						processing--;
						logMessage();
						await writeFile(file, data);
						writing--;
						logMessage();
					}
				});

				processing = promises.length;
				writing = promises.length;
				total = promises.length;

				logMessage();

				const start = performance.now();
				await Promise.all(promises);
				const stop = performance.now();
				console.log(`Files compression took ${((stop - start)/1000).toFixed(1)}s`);
			}
		}
	}
}