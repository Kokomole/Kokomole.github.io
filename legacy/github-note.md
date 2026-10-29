<!-- meta {"date":"2020-08-01","slug":"github-note","title":"GitHub使用笔记","tags":["Git"]} -->

## 1. GitHub本地仓库配置

1.  输入用户名和邮箱

    ```
    git config --global user.name "xxx"
    git config --global user.email "xxx@xxx.com"
    ```
    
2.  验证

    ```
    git config --list --global
    ```
    
3.  初始化仓库

    ```
    git init
    ```
    
4.  建立SSH

    ```
    ssh-keygen -t rsa -C "xxx@xxx.com"
    ```
    
5.  在本地用户目录下找到`.ssh`文件夹，复制`id_rsa.pub`文件的内容，在GitHub网站设置里新建ssh，将复制的内容贴进去
    
6.  测试是否连接成功

    ```
    ssh -T git@github.com
    ```
    
    由于所在网络防火墙的原因，这一步可能报错：`ssh_exchange_identification: read: Connection reset by peer`
    

此时已经完成与本地仓库的连接。

## 2. GitHub的基本操作

-   克隆项目

    ```
    git clone url
    ```
