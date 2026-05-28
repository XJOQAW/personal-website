import os
from PIL import Image
import numpy as np
from typing import Dict, Any


class ImageEncryptor:
    """图片加密器"""
    
    def __init__(self):
        pass
    
    def encrypt_image(self, image_path: str, output_path: str, password: str) -> Dict[str, Any]:
        """加密图片"""
        try:
            img = Image.open(image_path)
            img_array = np.array(img)
            
            # 使用密码生成密钥
            np.random.seed(self._password_to_seed(password))
            key = np.random.randint(0, 256, size=img_array.shape, dtype=np.uint8)
            
            # XOR加密
            encrypted = np.bitwise_xor(img_array, key)
            
            # 保存加密后的图片
            encrypted_img = Image.fromarray(encrypted)
            encrypted_img.save(output_path)
            
            return {
                'success': True,
                'output_path': output_path,
                'output_size': os.path.getsize(output_path)
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def decrypt_image(self, image_path: str, output_path: str, password: str) -> Dict[str, Any]:
        """解密图片"""
        # XOR加密是对称的，解密过程与加密相同
        return self.encrypt_image(image_path, output_path, password)
    
    def _password_to_seed(self, password: str) -> int:
        """将密码转换为随机种子"""
        import hashlib
        hash_obj = hashlib.sha256(password.encode())
        return int(hash_obj.hexdigest(), 16) % (2**32)
