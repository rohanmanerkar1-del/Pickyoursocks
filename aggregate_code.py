import os

def create_codebase_summary(root_dir, output_file):
    exclude_dirs = {'.git', 'node_modules', 'dist', 'build', '.next', '__pycache__'}
    exclude_files = {'package-lock.json', 'yarn.lock', '.DS_Store', 'favicon.ico'}
    include_extensions = {'.ts', '.tsx', '.js', '.jsx', '.json', '.html', '.css', '.md', '.env', '.py'}

    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("# Pickyoursocks Project Codebase Summary\n")
        f.write(f"# Generated for GPT sharing\n")
        f.write("# " + "="*50 + "\n\n")

        for root, dirs, files in os.walk(root_dir):
            # Prune directories
            dirs[:] = [d for d in dirs if d not in exclude_dirs]
            
            for file in files:
                if file in exclude_files:
                    continue
                
                ext = os.path.splitext(file)[1].lower()
                if ext not in include_extensions:
                    continue

                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, root_dir)
                
                f.write(f"\n{'='*20}\n")
                f.write(f"FILE: {rel_path}\n")
                f.write(f"{'='*20}\n\n")
                
                try:
                    with open(full_path, 'r', encoding='utf-8') as src:
                        f.write(src.read())
                except Exception as e:
                    f.write(f"Error reading file: {e}")
                
                f.write("\n\n")

if __name__ == "__main__":
    project_root = r"c:\Users\rohan\OneDrive\Desktop\hi\Pickyoursocks"
    output_path = r"c:\Users\rohan\OneDrive\Desktop\hi\Pickyoursocks\pickyoursocks_full_codebase.txt"
    create_codebase_summary(project_root, output_path)
    print(f"Codebase summary created at: {output_path}")
