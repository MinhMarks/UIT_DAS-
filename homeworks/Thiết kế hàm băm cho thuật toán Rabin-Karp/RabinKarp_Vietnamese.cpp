#include <iostream>
#include <string>
#include <vector>
#include <locale>
#include <codecvt>

using namespace std;

// Base Prime b=311 and Mersenne Prime Modulo M=2^61-1
const uint64_t B = 311;
const uint64_t MOD = (1ULL << 61) - 1;

// Modulo computation using Bitwise Shift
uint64_t mod_mersenne(uint64_t x) {
    uint64_t res = (x & MOD) + (x >> 61);
    if (res >= MOD) {
        res -= MOD;
    }
    return res;
}

// Simulated Preprocessing: Normalizing Vietnamese NFC and Case Folding
// (Using standard string conversion as placeholder for real ICU libraries)
u32string preprocess(const string& text) {
    wstring_convert<codecvt_utf8<char32_t>, char32_t> cvt;
    u32string utf32_str = cvt.from_bytes(text);
    
    // Convert to lowercase
    locale loc("");
    for (auto& ch : utf32_str) {
        ch = tolower(ch, loc);
    }
    // Note: In a real system, NFC normalization using libraries like ICU is required here.
    return utf32_str;
}

// Optimized Rabin-Karp Matching Function
vector<int> rabin_karp_search(const string& text_str, const string& pattern_str) {
    vector<int> occurrences;
    
    u32string T = preprocess(text_str);
    u32string P = preprocess(pattern_str);
    
    int n = T.length();
    int m = P.length();
    
    if (m == 0 || m > n) return occurrences;
    
    uint64_t hash_P = 0, hash_T = 0, pow_b = 1;
    
    // Hash pattern and first window
    for (int i = 0; i < m; ++i) {
        hash_P = mod_mersenne(mod_mersenne(hash_P * B) + P[i]);
        hash_T = mod_mersenne(mod_mersenne(hash_T * B) + T[i]);
    }
    
    // pow_b = (B ^ (m-1)) % M
    for (int i = 1; i < m; ++i) {
        pow_b = mod_mersenne(pow_b * B);
    }
    
    for (int i = 0; i <= n - m; ++i) {
        if (hash_P == hash_T) {
            occurrences.push_back(i); // Match found
        }
        
        // Slide window
        if (i < n - m) {
            uint64_t remove_val = mod_mersenne(T[i] * pow_b);
            
            // Handle negative modulus safely
            if (hash_T < remove_val) {
                hash_T += MOD;
            }
            hash_T -= remove_val;
            
            hash_T = mod_mersenne(mod_mersenne(hash_T * B) + T[i + m]);
        }
    }
    
    return occurrences;
}

int main() {
    string text = "Đại học công nghệ thông tin, khoa học máy tính là nền tảng";
    string pattern = "khoa học";
    
    vector<int> pos = rabin_karp_search(text, pattern);
    
    cout << "Pattern found at positions: ";
    for (int p : pos) {
        cout << p << " ";
    }
    cout << endl;
    
    return 0;
}
