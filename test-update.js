#!/usr/bin/env node
/**
 * 自动更新测试脚本 - 简化版
 * 测试GitHub Release检测功能
 */
const https = require('https');

// ============ 配置信息（需要你修改） ============
const CONFIG = {
    // 你的GitHub用户名
    GITHUB_USER: "156966qq",
    
    // 你的仓库名
    GITHUB_REPO: "luohua-wuqing-ks-script",
    
    // 当前版本号（测试用，可以随便写）
    CURRENT_VERSION: "v0.0.1",
    
    // 脚本文件名（在GitHub上的文件名）
    SCRIPT_FILE: "test-update.js"
};

// ============ 工具函数 ============
function httpGet(url) {
    return new Promise((resolve, reject) => {
        console.log(`🌐 请求: ${url}`);
        
        https.get(url, {
            headers: {
                'User-Agent': 'AutoUpdate-Test-Script/1.0',
                'Accept': 'application/vnd.github.v3+json'
            },
            timeout: 10000  // 10秒超时
        }, (response) => {
            let data = '';
            
            // 收集数据
            response.on('data', (chunk) => {
                data += chunk;
            });
            
            // 请求完成
            response.on('end', () => {
                console.log(`📡 响应状态: ${response.statusCode}`);
                
                if (response.statusCode === 200) {
                    try {
                        const jsonData = JSON.parse(data);
                        resolve(jsonData);
                    } catch (error) {
                        reject(new Error(`JSON解析失败: ${error.message}`));
                    }
                } else {
                    reject(new Error(`HTTP ${response.statusCode}: ${data.substring(0, 100)}`));
                }
            });
            
        }).on('error', (error) => {
            reject(new Error(`网络错误: ${error.message}`));
        }).on('timeout', () => {
            reject(new Error('请求超时'));
        });
    });
}

// ============ 版本比较函数 ============
function compareVersions(v1, v2) {
    console.log(`📊 版本比较: ${v1} vs ${v2}`);
    
    // 简单版本比较（v1.2.3格式）
    const parseVersion = (v) => {
        // 移除 'v' 前缀，按 '.' 分割
        return v.replace(/^v/, '').split('.').map(Number);
    };
    
    const v1Parts = parseVersion(v1);
    const v2Parts = parseVersion(v2);
    
    for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
        const p1 = v1Parts[i] || 0;
        const p2 = v2Parts[i] || 0;
        
        if (p1 < p2) return -1;  // v1 < v2
        if (p1 > p2) return 1;   // v1 > v2
    }
    
    return 0;  // 相等
}

// ============ 核心更新检测函数 ============
async function checkForUpdates() {
    console.log('='.repeat(50));
    console.log('🚀 自动更新测试脚本');
    console.log('='.repeat(50));
    
    console.log(`👤 GitHub用户: ${CONFIG.GITHUB_USER}`);
    console.log(`📦 仓库: ${CONFIG.GITHUB_REPO}`);
    console.log(`📱 当前版本: ${CONFIG.CURRENT_VERSION}`);
    console.log('');
    
    try {
        // 1. 测试GitHub API连接
        console.log('🔍 步骤1: 测试GitHub API连接...');
        const repoUrl = `https://api.github.com/repos/${CONFIG.GITHUB_USER}/${CONFIG.GITHUB_REPO}`;
        
        try {
            const repoInfo = await httpGet(repoUrl);
            console.log(`✅ 仓库信息:`);
            console.log(`   名称: ${repoInfo.full_name}`);
            console.log(`   描述: ${repoInfo.description || '(无描述)'}`);
            console.log(`   公开: ${repoInfo.private ? '否' : '是'}`);
            console.log(`   星标: ${repoInfo.stargazers_count}`);
        } catch (error) {
            console.log(`❌ 仓库连接失败: ${error.message}`);
            console.log('💡 可能原因:');
            console.log('   - 仓库不存在');
            console.log('   - 仓库不是公开的');
            console.log('   - 网络问题');
            return false;
        }
        
        console.log('');
        
        // 2. 检查Releases
        console.log('🔍 步骤2: 检查Release版本...');
        const releasesUrl = `https://api.github.com/repos/${CONFIG.GITHUB_USER}/${CONFIG.GITHUB_REPO}/releases`;
        
        try {
            const releases = await httpGet(releasesUrl);
            
            if (releases.length === 0) {
                console.log('⚠️  没有找到任何Release版本');
                console.log('💡 请到GitHub仓库创建第一个Release:');
                console.log(`   https://github.com/${CONFIG.GITHUB_USER}/${CONFIG.GITHUB_REPO}/releases/new`);
                console.log('   标签格式: v1.0.0');
                return false;
            }
            
            console.log(`✅ 找到 ${releases.length} 个Release版本`);
            
            // 显示最新的3个版本
            const latestReleases = releases.slice(0, 3);
            latestReleases.forEach((release, index) => {
                console.log(`\n   ${index + 1}. ${release.tag_name}`);
                console.log(`      标题: ${release.name || '(无标题)'}`);
                console.log(`      时间: ${release.published_at}`);
                if (release.body) {
                    console.log(`      描述: ${release.body.substring(0, 50)}...`);
                }
            });
            
        } catch (error) {
            console.log(`❌ 获取Release失败: ${error.message}`);
            return false;
        }
        
        console.log('');
        
        // 3. 检查最新版本（updater.js实际使用的接口）
        console.log('🔍 步骤3: 检查最新版本（/releases/latest）...');
        const latestUrl = `https://api.github.com/repos/${CONFIG.GITHUB_USER}/${CONFIG.GITHUB_REPO}/releases/latest`;
        
        try {
            const latestRelease = await httpGet(latestUrl);
            
            console.log(`✅ 最新版本: ${latestRelease.tag_name}`);
            console.log(`   标题: ${latestRelease.name || '(无标题)'}`);
            console.log(`   发布时间: ${latestRelease.published_at}`);
            
            // 版本比较
            const comparison = compareVersions(CONFIG.CURRENT_VERSION, latestRelease.tag_name);
            
            if (comparison < 0) {
                console.log(`🎉 发现新版本: ${CONFIG.CURRENT_VERSION} → ${latestRelease.tag_name}`);
                
                if (latestRelease.body) {
                    console.log(`\n📝 更新内容:`);
                    console.log(`   ${latestRelease.body.substring(0, 150)}...`);
                }
                
                console.log(`\n🔗 发布页面: ${latestRelease.html_url}`);
                console.log(`\n💡 在实际脚本中，这里会自动下载更新`);
                
                return {
                    hasUpdate: true,
                    currentVersion: CONFIG.CURRENT_VERSION,
                    latestVersion: latestRelease.tag_name,
                    updateUrl: latestRelease.html_url
                };
                
            } else if (comparison === 0) {
                console.log('✅ 已是最新版本');
                return { hasUpdate: false };
            } else {
                console.log('⚠️  当前版本比最新版本还新？（可能是测试数据）');
                return { hasUpdate: false };
            }
            
        } catch (error) {
            if (error.message.includes('404')) {
                console.log('❌ /releases/latest 返回404');
                console.log('💡 可能原因:');
                console.log('   1. 没有创建任何Release');
                console.log('   2. Release被删除');
                console.log('   3. 权限问题');
            } else {
                console.log(`❌ 检查最新版本失败: ${error.message}`);
            }
            return false;
        }
        
    } catch (error) {
        console.log(`💥 测试过程出错: ${error.message}`);
        return false;
    }
}

// ============ 测试文件下载（可选） ============
async function testFileDownload() {
    console.log('\n' + '='.repeat(50));
    console.log('📥 测试文件下载功能');
    console.log('='.repeat(50));
    
    const fileUrl = `https://raw.githubusercontent.com/${CONFIG.GITHUB_USER}/${CONFIG.GITHUB_REPO}/main/README.md`;
    
    console.log(`测试下载: ${fileUrl}`);
    
    try {
        const response = await new Promise((resolve, reject) => {
            https.get(fileUrl, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => resolve({
                    statusCode: res.statusCode,
                    data: data
                }));
            }).on('error', reject);
        });
        
        if (response.statusCode === 200) {
            console.log(`✅ 文件下载成功`);
            console.log(`   文件大小: ${response.data.length} 字符`);
            console.log(`   内容预览: ${response.data.substring(0, 100).replace(/\n/g, ' ')}...`);
        } else {
            console.log(`❌ 文件下载失败: HTTP ${response.statusCode}`);
        }
        
    } catch (error) {
        console.log(`❌ 下载测试失败: ${error.message}`);
    }
}

// ============ 主函数 ============
async function main() {
    console.log('🎯 开始自动更新系统测试\n');
    
    // 测试更新检测
    const updateResult = await checkForUpdates();
    
    if (updateResult) {
        console.log('\n' + '='.repeat(50));
        console.log('📊 测试结果总结');
        console.log('='.repeat(50));
        
        if (updateResult.hasUpdate) {
            console.log(`✅ 自动更新系统工作正常！`);
            console.log(`   当前: ${updateResult.currentVersion}`);
            console.log(`   最新: ${updateResult.latestVersion}`);
            console.log(`\n💡 在实际脚本中:`);
            console.log(`   1. 会提示用户更新`);
            console.log(`   2. 自动下载新版本脚本`);
            console.log(`   3. 替换当前文件`);
        } else {
            console.log(`✅ 更新检测功能正常，暂无新版本`);
        }
        
        // 可选：测试文件下载
        console.log('\n是否测试文件下载功能？(y/n)');
        
        // 简单等待输入
        process.stdin.setEncoding('utf8');
        process.stdin.once('data', async (input) => {
            if (input.trim().toLowerCase() === 'y') {
                await testFileDownload();
            }
            console.log('\n🎯 测试完成！');
            process.exit(0);
        });
        
    } else {
        console.log('\n❌ 自动更新系统测试失败');
        console.log('💡 请检查:');
        console.log('   1. GitHub仓库是否正确');
        console.log('   2. 是否创建了Release');
        console.log('   3. 网络连接是否正常');
        process.exit(1);
    }
}

// ============ 启动测试 ============
if (require.main === module) {
    main().catch(error => {
        console.error('💥 测试程序崩溃:', error);
        process.exit(1);
    });
}

// 导出函数供其他模块使用
module.exports = { checkForUpdates, compareVersions };