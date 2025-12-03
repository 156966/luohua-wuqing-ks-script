#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
测试自动更新功能
"""
import requests
import json

def test_github_connection():
    """测试GitHub连接"""
    print("=== 开始测试 ===")
    
    # 你的仓库信息
    github_user = "156966qq"
    github_repo = "luohua-wuqing-ks-script"
    api_url = f"https://api.github.com/repos/{github_user}/{github_repo}"
    
    print(f"📦 测试仓库: {github_user}/{github_repo}")
    print(f"🔗 API地址: {api_url}")
    
    try:
        # 测试1: 访问仓库信息
        print("\n1. 测试仓库访问...")
        response = requests.get(api_url, timeout=10)
        
        if response.status_code == 200:
            repo_data = response.json()
            print(f"✅ 仓库存在: {repo_data.get('full_name')}")
            print(f"📝 描述: {repo_data.get('description')}")
            print(f"⭐ Star数: {repo_data.get('stargazers_count')}")
            print(f"🍴 Fork数: {repo_data.get('forks_count')}")
        else:
            print(f"❌ 仓库访问失败: {response.status_code}")
            return False
        
        # 测试2: 检查Releases
        print("\n2. 测试发布版本...")
        releases_url = f"{api_url}/releases"
        response = requests.get(releases_url, timeout=10)
        
        if response.status_code == 200:
            releases = response.json()
            if releases:
                print(f"✅ 找到 {len(releases)} 个发布版本")
                for release in releases[:3]:  # 显示最近3个
                    print(f"  版本: {release.get('tag_name')}")
                    print(f"  标题: {release.get('name')}")
                    print(f"  时间: {release.get('published_at')}")
                    print()
            else:
                print("⚠️  还没有发布版本，请创建一个Release")
                print("   在仓库页面点击 'Releases' → 'Create a new release'")
        else:
            print(f"❌ 获取发布信息失败: {response.status_code}")
        
        # 测试3: 检查最新版本
        print("\n3. 测试最新版本检查...")
        latest_url = f"{api_url}/releases/latest"
        response = requests.get(latest_url, timeout=10)
        
        if response.status_code == 200:
            latest = response.json()
            print(f"✅ 最新版本: {latest.get('tag_name')}")
            print(f"📝 标题: {latest.get('name')}")
            print(f"📅 发布时间: {latest.get('published_at')}")
        elif response.status_code == 404:
            print("⚠️  还没有最新版本，请创建第一个Release")
        else:
            print(f"❌ 获取最新版本失败: {response.status_code}")
        
        print("\n=== 测试完成 ===")
        return True
        
    except requests.exceptions.ConnectionError:
        print("❌ 网络连接失败，请检查网络")
        return False
    except Exception as e:
        print(f"❌ 测试过程出错: {e}")
        return False

def download_test():
    """测试下载功能"""
    print("\n4. 测试下载功能...")
    
    # 测试下载README文件
    raw_url = "https://raw.githubusercontent.com/156966qq/luohua-wuqing-ks-script/main/README.md"
    
    try:
        response = requests.get(raw_url, timeout=10)
        if response.status_code == 200:
            print(f"✅ 文件下载成功，大小: {len(response.text)} 字符")
            print(f"📄 文件前100字符: {response.text[:100]}...")
        else:
            print(f"❌ 文件下载失败: {response.status_code}")
    except Exception as e:
        print(f"❌ 下载测试失败: {e}")

if __name__ == "__main__":
    print("快手脚本自动更新系统测试")
    print("=" * 40)
    
    # 运行测试
    success = test_github_connection()
    
    if success:
        download_test()
        
    print("\n" + "=" * 40)
    print("💡 建议操作:")
    print("1. 确保仓库是 Public（公开）")
    print("2. 创建一个 Release 版本")
    print("3. 上传 main.py、updater.py 等文件")
    print("4. 用户下载后就能自动更新了")
    
    input("\n按回车键退出...")