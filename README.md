# File Manager

## Description

This Node.js-based File Manager provides a command-line interface for performing various file operations, system information retrieval, hash calculations, and compression/decompression tasks.

## Features

- **CLI-based interaction:**  Interact with the file system through a command-line interface.
- **Basic File Operations:**  Create, read, copy, move, delete, and rename files and directories.
- **Streams API:** Utilizes the Streams API for efficient file processing during copy, move, compress, and decompress operations.
- **OS Information:** Retrieve information about the host machine's operating system, such as EOL, CPU details, home directory, username, and architecture.
- **Hash Calculation:** Calculate the SHA256 hash of a file.
- **Compression/Decompression:** Compress and decompress files using the Brotli algorithm.

## Usage

### Prerequisites

- Node.js version 22.14.0 or higher.

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository_url>
    cd <repository_directory>
    ```

### Running the File Manager

1.  Start the application using the following npm script, providing your username:
    ```bash
    npm run start -- --username=your_username
    ```

### Available Commands

**Navigation & Working Directory (nwd)**

*   `up`: Go up one level in the directory structure.
*   `cd <path_to_directory>`: Change the current directory.
*   `ls`: List files and directories in the current directory.  Folders are listed first, followed by files, all sorted alphabetically.

**Basic Operations with Files**

*   `cat <path_to_file>`: Read and print the contents of a file.
*   `add <new_file_name>`: Create a new empty file.
*   `mkdir <new_directory_name>`: Create a new directory.
*   `rn <path_to_file> <new_filename>`: Rename a file.
*   `cp <path_to_file> <path_to_new_directory>`: Copy a file to a new directory.
*   `mv <path_to_file> <path_to_new_directory>`: Move a file to a new directory.
*   `rm <path_to_file>`: Delete a file.

**Operating System Info**

*   `os --EOL`: Get and print the End-Of-Line character.
*   `os --cpus`: Get and print CPU information.
*   `os --homedir`: Get and print the home directory.
*   `os --username`: Get and print the current system user name.
*   `os --architecture`: Get and print the CPU architecture.

**Hash Calculation**

*   `hash <path_to_file>`: Calculate and print the SHA256 hash of a file.

**Compress and Decompress Operations**

*   `compress <path_to_file> <path_to_destination>`: Compress a file using Brotli.
*   `decompress <path_to_file> <path_to_destination>`: Decompress a file using Brotli.

### Exiting the Application

*   Type `.exit` or press `Ctrl+C` to exit the File Manager.

## Error Handling

The File Manager provides error messages for:

-   Invalid input (missing arguments, wrong data types).
-   Failed operations (non-existent files, insufficient permissions).