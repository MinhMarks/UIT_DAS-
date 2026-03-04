import external_sort
import struct
import os

def log(msg):
    try:
        print(msg)
    except:
        pass

def test_sort():
    input_file = "test_sample.bin"
    output_file = "test_output.bin"
    
    # Generate 50 doubles
    external_sort.generate_sample_file(input_file, 50, log)
    
    # Sort with chunk size 10 (will create 5 chunks)
    success = external_sort.external_sort(input_file, output_file, 10, log)
    if not success:
        print("Sorting failed!")
        return
        
    # Verify
    with open(output_file, "rb") as f:
        data = f.read()
        elements = list(struct.unpack(f'<{len(data)//8}d', data))
        
        if elements == sorted(elements):
            print("Verification SUCCESS! The output file is strictly sorted.")
        else:
            print("Verification FAILED! The output is not sorted.")
            
    # Cleanup
    if os.path.exists(input_file): os.remove(input_file)
    if os.path.exists(output_file): os.remove(output_file)

if __name__ == "__main__":
    test_sort()
