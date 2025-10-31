import qrcode
from PIL import Image
import io

def generate_qr_codes():
    """Generate QR codes using Python qrcode library"""
    
    # Test 1: Simple product ID
    print("Generating Python QR codes...")
    
    # Create QR with just text
    qr = qrcode.QRCode(
        version=1,  # Controls size (1 is smallest)
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    
    # Add data and make QR
    product_id = "F1-Jacket-25-001"
    qr.add_data(product_id)
    qr.make(fit=True)
    
    # Create image
    img = qr.make_image(fill_color="black", back_color="white")
    img.save("python-qr-simple.png")
    print(f"✓ Created python-qr-simple.png with: {product_id}")
    
    # Test 2: Using quick method
    img2 = qrcode.make("TEST123")
    img2.save("python-qr-test.png")
    print("✓ Created python-qr-test.png with: TEST123")
    
    # Test 3: URL format
    url_qr = qrcode.make("https://example.com/product/F1-Jacket-25-001")
    url_qr.save("python-qr-url.png")
    print("✓ Created python-qr-url.png with URL")
    
    # Test 4: High error correction
    qr_high = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,  # Highest error correction
        box_size=10,
        border=4,
    )
    qr_high.add_data("F1-Jacket-25-001")
    qr_high.make(fit=True)
    img_high = qr_high.make_image(fill_color="black", back_color="white")
    img_high.save("python-qr-high-ec.png")
    print("✓ Created python-qr-high-ec.png with high error correction")
    
    # Test 5: Larger version for better scanning
    qr_large = qrcode.QRCode(
        version=5,  # Larger size
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=8,
        border=2,
    )
    qr_large.add_data("F1-Jacket-25-001")
    qr_large.make(fit=True)
    img_large = qr_large.make_image(fill_color="black", back_color="white")
    img_large.save("python-qr-large.png")
    print("✓ Created python-qr-large.png with larger size")
    
    print("\n✅ All Python QR codes created!")
    print("\nTry scanning these files:")
    print("  - python-qr-simple.png (F1-Jacket-25-001)")
    print("  - python-qr-test.png (TEST123)")
    print("  - python-qr-url.png (URL format)")
    print("  - python-qr-high-ec.png (High error correction)")
    print("  - python-qr-large.png (Larger size)")

if __name__ == "__main__":
    try:
        generate_qr_codes()
    except ImportError:
        print("Installing qrcode library...")
        import subprocess
        subprocess.check_call(["pip", "install", "qrcode[pil]"])
        print("Library installed. Running again...")
        generate_qr_codes()