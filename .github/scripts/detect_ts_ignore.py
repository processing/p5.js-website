#!/usr/bin/env python3
"""Script to detect and report usage of @ts-ignore comments in TypeScript."""

import argparse
import re
import sys
import logging
import os

logging.basicConfig(
    level=logging.INFO,
    format="%(levelname)s: %(message)s",
)



IGNORED_EXTENSIONS = {
    ".avif",
    ".jpeg",
    ".jpg",
    ".png",
    ".webp",
    ".gif",
    ".bmp",
    ".ico",
    ".svg",
    ".mp4",
    ".webm",
    ".mov",
    ".avi",
    ".mkv",
    ".mp3",
    ".wav",
    ".ogg",
    ".pdf",
    ".doc",
    ".docx",
}


def is_binary_file(filepath: str) -> bool:
    """Check if a file is binary based on its extension.

    Args:
        filepath (str): The file path.

    Returns:
        bool: True if the file should be ignored, False otherwise.
    """
    return os.path.splitext(filepath)[1].lower() in IGNORED_EXTENSIONS

def check_ts_ignore(files: list[str]) -> int:
    """Check for occurrences of '@ts-ignore' in the given files, allowing justified ones."""
    ts_ignore_found = False

    for file in files:
        if not is_binary_file(file):
            try:
                logging.info("Checking file: %s", file)
                with open(file, encoding="utf-8") as f:
                    previous_line = ""  

                    for line_num, line in enumerate(f, start=1):
                        if "@ts-ignore" in line.strip():
                            if not re.search(r"//\s*Reason:.*", previous_line.strip()):
                                print(f"❌ Error: '@ts-ignore' found in {file} at line {line_num}")
                                logging.debug("Found @ts-ignore without Reason: in line: %s", line.strip())
                                ts_ignore_found = True
                        previous_line = line

            except FileNotFoundError:
                logging.warning("File not found: %s", file)
            except OSError:
                logging.exception("Could not read %s", file)

    if not ts_ignore_found:
        print("✅ No '@ts-ignore' comments found in the files.")

    return 1 if ts_ignore_found else 0


def main() -> None:
    """Main function to parse arguments and run the check.

    This function sets up argument parsing for file paths and runs the ts-ignore
    check on the specified files.

    Args:
        None

    Returns:
        None: The function exits the program with status code 0 if no ts-ignore
        comments are found, or 1 if any are detected.
    """
    parser = argparse.ArgumentParser(
        description="Check for @ts-ignore in changed files.",
    )
    parser.add_argument(
        "--files",
        nargs="+",
        help="List of changed files",
        required=True,
    )
    args = parser.parse_args()

    ts_files = [f for f in args.files if f.endswith((".ts", ".tsx"))]
    if not ts_files:
        logging.info("No TypeScript files to check.")
        sys.exit(0)

    exit_code = check_ts_ignore(args.files)
    sys.exit(exit_code)


if __name__ == "__main__":
    main()