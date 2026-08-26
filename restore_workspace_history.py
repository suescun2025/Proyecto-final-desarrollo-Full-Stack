import json
import os
import glob

workspace_root = "/Users/yefersonsuescun/Documents/Proyecto Final Full Stack"
brain_dir = "/Users/yefersonsuescun/.gemini/antigravity-ide/brain"

print("Searching for all conversation transcripts...")
transcript_files = glob.glob(os.path.join(brain_dir, "*/.system_generated/logs/transcript_full.jsonl"))

# Gather all operations with their timestamps
operations = []

for t_path in transcript_files:
    conv_id = os.path.basename(os.path.dirname(os.path.dirname(os.path.dirname(t_path))))
    # Skip our current conversation to avoid replaying our own recovery actions
    if conv_id == "0161b857-cd84-4c8a-834d-e06730d1cf2d":
        continue
        
    print(f"Reading transcript: {conv_id}")
    with open(t_path, "r") as f:
        for line in f:
            try:
                data = json.loads(line)
            except Exception:
                continue
                
            created_at = data.get("created_at")
            tool_calls = data.get("tool_calls", [])
            if not tool_calls or not created_at:
                continue
                
            for call in tool_calls:
                name = call.get("name")
                args = call.get("args", {})
                if isinstance(args, str):
                    try:
                        args = json.loads(args)
                    except Exception:
                        continue
                        
                target_file = args.get("TargetFile")
                if target_file and target_file.startswith(workspace_root):
                    operations.append({
                        "timestamp": created_at,
                        "conv_id": conv_id,
                        "tool": name,
                        "args": args
                    })

# Sort operations chronologically by timestamp
operations.sort(key=lambda x: x["timestamp"])
print(f"Sorted {len(operations)} operations chronologically.")

# Replay operations on the workspace
for op in operations:
    tool = op["tool"]
    args = op["args"]
    target_file = args["TargetFile"]
    timestamp = op["timestamp"]
    conv_id = op["conv_id"]
    
    print(f"[{timestamp}] Replaying {tool} on {os.path.basename(target_file)} (Conv: {conv_id})")
    
    # Ensure directory exists
    os.makedirs(os.path.dirname(target_file), exist_ok=True)
    
    if tool == "write_to_file":
        content = args.get("CodeContent")
        with open(target_file, "w") as f:
            f.write(content)
            
    elif tool == "replace_file_content":
        target_content = args.get("TargetContent")
        replacement_content = args.get("ReplacementContent")
        
        if not os.path.exists(target_file):
            print(f"  WARNING: File {target_file} does not exist for replace_file_content!")
            continue
            
        with open(target_file, "r") as f:
            content = f.read()
            
        if target_content in content:
            new_content = content.replace(target_content, replacement_content, 1)
            with open(target_file, "w") as f:
                f.write(new_content)
        else:
            # Try with clean whitespace/newlines just in case
            norm_target = "\n".join(line.strip() for line in target_content.strip().splitlines())
            norm_content = "\n".join(line.strip() for line in content.strip().splitlines())
            if norm_target in norm_content:
                print("  Matches with normalized whitespace.")
                # We do a basic replace but warning: it might lose original indentations. Let's try direct search first.
            print(f"  ERROR: TargetContent not found in {os.path.basename(target_file)}!")
            
    elif tool == "multi_replace_file_content":
        chunks = args.get("ReplacementChunks", [])
        if not os.path.exists(target_file):
            print(f"  WARNING: File {target_file} does not exist for multi_replace_file_content!")
            continue
            
        with open(target_file, "r") as f:
            content = f.read()
            
        success = True
        for chunk in chunks:
            tc = chunk.get("TargetContent")
            rc = chunk.get("ReplacementContent")
            if tc in content:
                content = content.replace(tc, rc, 1)
            else:
                print(f"  ERROR: Chunk TargetContent not found in {os.path.basename(target_file)}!")
                success = False
                
        if success:
            with open(target_file, "w") as f:
                f.write(content)

print("Replay completed!")
