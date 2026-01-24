from anthropic import Anthropic
import os
from dotenv import load_dotenv

load_dotenv()

try:
    client = Anthropic(
        # 推荐使用 127.0.0.1
        base_url="http://127.0.0.1:8045",
        api_key=os.getenv("GLM_API_KEY")
    )

    print("Sending request to GLM-4.7 via proxy...")
    
    # 注意: Antigravity 支持使用 Anthropic SDK 调用任意模型
    response = client.messages.create(
        model="glm-4.7",
        max_tokens=1024,
        messages=[{"role": "user", "content": "Hello! Who are you?"}]
    )

    print("\nResponse:")
    print(response.content[0].text)

except Exception as e:
    print(f"\nError: {e}")
