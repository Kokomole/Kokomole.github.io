<!-- meta {"date":"2020-12-20","slug":"3dqxRJSXGw","title":"群体PK建模软件的安装","tags":["NONMEM"]} -->

包括NONMEM（以及Fortran）、PsN（以及Perl）、Pirana、R（以及RStudio）、Monolix（以及Simulx）、MATLAB。所有软件安装均在Windows10环境下进行。

## 1. NONMEM

NONMEM是一个使用Fortran语言编写的软件，所以安装NONMEM之前首先要安装Fortran编译器。

### 1.1 安装Fortran编译器

GNU编译器套裝（简称GCC）是一套标准的跨平台的编程语言编译器，其中编译Fortran语言的有2版，针对Fortran77叫做G77，针对Fortran90的叫做GFortran，这里使用GFortran。Windows下的GFortran下载地址为：https://sourceforge.net/projects/mingw/files/MinGW/Base/gcc/Version6/ 。

NONMEM安装程序中自带Windows系统的GFortran编译器，版本为4.6.0，是一个名为`gfortran-windows-460.exe`的文件，双击运行该文件即可。完成后可在DOS下输入命令`gfortran -v`检查是否安装成功，此时会显示GFortran的版本。

```
>gfortran -v
Using built-in specs.
COLLECT_GCC=gfortran
COLLECT_LTO_WRAPPER=C:/Strawberry/c/bin/../libexec/gcc/x86_64-w64-mingw32/8.3.0/lto-wrapper.exe
Target: x86_64-w64-mingw32
Configured with: ../../../src/gcc-8.3.0/configure --host=x86_64-w64-mingw32 --build=x86_64-w64-mingw32 --target=x86_64-w64-mingw32 --prefix=/mingw64 --enable-shared --enable-static --disable-multilib --enable-languages=c,c++,fortran,lto --enable-libstdcxx-time=yes --enable-threads=posix --enable-libgomp --enable-libatomic --enable-lto --enable-graphite --enable-checking=release --enable-fully-dynamic-string --enable-version-specific-runtime-libs --enable-libstdcxx-filesystem-ts=yes --disable-libstdcxx-pch --disable-libstdcxx-debug --disable-bootstrap --disable-rpath --disable-win32-registry --disable-nls --disable-werror --disable-symvers --with-gnu-as --with-gnu-ld --with-arch=nocona --with-tune=core2 --with-libiconv --with-system-zlib --with-gmp=/opt/build/prerequisites/x86_64-w64-mingw32-static --with-mpfr=/opt/build/prerequisites/x86_64-w64-mingw32-static --with-mpc=/opt/build/prerequisites/x86_64-w64-mingw32-static --with-isl=/opt/build/prerequisites/x86_64-w64-mingw32-static --with-pkgversion='x86_64-posix-seh, Built by strawberryperl.com project' --with-bugurl=https://sourceforge.net/projects/mingw-w64 CFLAGS='-O2 -pipe -fno-ident -I/opt/build/x86_64-830-posix-seh-rt_v6/mingw64/opt/include -I/opt/build/prerequisites/x86_64-zlib-static/include -I/opt/build/prerequisites/x86_64-w64-mingw32-static/include' CXXFLAGS='-O2 -pipe -fno-ident -I/opt/build/x86_64-830-posix-seh-rt_v6/mingw64/opt/include -I/opt/build/prerequisites/x86_64-zlib-static/include -I/opt/build/prerequisites/x86_64-w64-mingw32-static/include' CPPFLAGS=' -I/opt/build/x86_64-830-posix-seh-rt_v6/mingw64/opt/include -I/opt/build/prerequisites/x86_64-zlib-static/include -I/opt/build/prerequisites/x86_64-w64-mingw32-static/include' LDFLAGS='-pipe -fno-ident -L/opt/build/x86_64-830-posix-seh-rt_v6/mingw64/opt/lib -L/opt/build/prerequisites/x86_64-zlib-static/lib -L/opt/build/prerequisites/x86_64-w64-mingw32-static/lib ' LD_FOR_TARGET=/opt/build/x86_64-830-posix-seh-rt_v6/mingw64/bin/ld.exe
Thread model: posix
gcc version 8.3.0 (x86_64-posix-seh, Built by strawberryperl.com project)
```

### 1.2 安装NONMEM

在DOS环境下进入NONMEM安装文件所在目录。如NONMEM安装文件为D盘下的`NM73AUG2013`文件（7.3版本），想要把NONMEM安装到到C盘的`nm73`目录下，则所用的命令为：

```
SETUP73 D:\NM73AUG2013 C:\nm73 gfortran
```

该命令分为4个部分，`SETUP73`代表安装7.3版本的NONMEM，7.4版本要做相应的改变；`D:\NM73AUG2013`为安装文件的完整路径；`C:\nm73`为将要安装的目标路径；`gfortran`为所用的编译器，在上一步中已经将GFortran编译器成功安装到系统中的了。

输入以上命令后，会询问是否继续：

```
continue <y/n>? [y] 
```

选择`y`，此时就会开始安装。这一步的安装用时较长，堪称安装过程的“限速步骤”，只需耐心等待，如果想知道安装的进度，可以在目标路径`C:\nm73`下找到`progress.txt`文件，打开它，你会看到一下内容：

```
           0 %
           1 %
           2 %
           3 %
```

这就是进度条，当达到100%时，就代表安装结束了。安装完成后，会测试是否安装成功：

```
Do you want to test the installation<y/n>?
```

选择`y`，会让你比较两个OFV值，这个数字应该是104.61，这代表你的NONMEM已经安装成功，可正常使用了。

> NONMEM是有使用时限的，过期之后需要重新购买许可证才能正常使用，它是NONMEM安装路径的`license`文件下的`nonmem.lic`文件。如果你购买了正版NONMEM，将该文件复制到你的NONMEM路径下即可。

## 2. PsN

从各种意义上来说，NONMEM都不是一个用户友好型的软件：所用的Fortran语言越来越不流行；基于命令行的操作使得药学出身的大多数用户望而却步；通篇的大写英文字母更是让人头皮发麻。

为了帮助NONMEM的使用，有人开发了一些NONMEM的辅助软件，如新西兰奥克兰大学Nick Holford教授基于DOS开发的[Wings for NONMEM](http://wfn.sourceforge.net/)（WFN）、基于R语言开发的[R for NONMEM](http://wfn.sourceforge.net/RFN-900-20090920.zip)，以及瑞典乌普萨拉大学基于Perl语言开发的[Perl-speaks-NONMEM](https://uupharmacometrics.github.io/PsN/)（PsN）。

PsN是目前最为广泛使用的NONMEM辅助软件，使用该软件首先需要安装Perl语言。

### 2.1 安装Perl

主流的Perl解释器有[ActivePerl](https://www.activestate.com/products/perl/downloads/)和[StrawberryPerl](http://strawberryperl.com/)两种，推荐使用StrawberryPerl。下载安装包双击运行即可。

安装后可在DOS下输入`perl -v`命令检查是否安装成功：

```
>perl -v

This is perl 5, version 30, subversion 2 (v5.30.2) built for MSWin32-x64-multi-thread

Copyright 1987-2020, Larry Wall

Perl may be copied only under the terms of either the Artistic License or the
GNU General Public License, which may be found in the Perl 5 source kit.

Complete documentation for Perl, including FAQ lists, should be found on
this system using "man perl" or "perldoc perl".  If you have access to the
Internet, point your browser at http://www.perl.org/, the Perl Home Page.
```

### 2.2 配置Perl计算环境

要想在Perl语言中使用NONMEM，需要安装Perl的一些科学计算库，在DOS下用`cpan`命令依次执行：

```
cpan Math::Random
cpan Statistics::Distributions
cpan MooseX::Params::Validate
cpan XML::LibXML
cpan YAML::XS
```

### 2.3 安装PsN

PsN完全免费，最新版本下载地址为：https://uupharmacometrics.github.io/PsN/download.html 。下载解压后，双击其中的`setup.pl`文件，或者在DOS中进入PsN-Source路径，执行命令`perl setup.pl`，即可进入PsN的安装过程。安装过程中会有很多对话，全部选择yes即可。

### 2.4 新版本PsN的安装

5.0及以上版本PsN的安装非常简单。

-   将PsN下载，解压到目标文件夹（方便起见，可以放在NONMEM安装路径里）
-   将PsN的bin目录（`PsN-5.2.6\strawberry\perl\bin`）添加到环境变量（PATH）中
-   在配置文件（`PsN-5.2.6\strawberry\perl\site\lib\PsN_5_2_6\psn.conf`）的`[nm_versions]`更新NONMEM的路径和版本：`default=C:\nm744,7.4.4`

## 3. Pirana

尽管PsN使得NONMEM的使用（如进行VPC、bootstrap等）简单很多，但是所有的操作依然是通过命令行进行，Certara公司的[Pirana](https://www.certara.com/software/pirana-modeling-workbench/)提供了运行NONMEM程序（包括绘图）的图形界面，使得建模过程更为方便。

Pirana有商业版，也有针对学术用户的免费版。下载地址为：https://lp.certara.com/WFDownloadPirana.html ，下载前需要填写表单。获得安装包后运行即可直接安装。

## 4. R语言

### 4.1 安装R语言

R语言是一个在统计学中有重要应用的编程语言，有着强大的绘图功能，是定量药理学研究中的常用工具。R语言开源免费，可在[CRAN](https://cran.r-project.org/mirrors.html)选择合适的镜像直接下载。

### 4.2 安装RStudio

RStudio是R语言的一个集成开发环境（IDE），它使得R的使用极为简单方便。[RStudio](https://rstudio.com/products/rstudio/download/)有桌面版和服务器版，这二者有各自有免费版和收费的Pro版。

## 5. Monolix

### 5.1 安装Lixoft套件

[Lixoft](http://lixoft.com/)由法国的Marc Lavielle等人开发，这套软件主要包括：

-   用于非房室和房室分析的PKanalix
-   用于非线性混合效应模型分析的Monolix
-   用于定量药理学模拟的Simulx

可通过edu邮箱申请免费的供学术使用的许可证。

### 5.2 安装Simulx

Simulx是一个基于R语言的模拟工具，通过`mlxR`包实现，功能十分丰富。mlxR虽然是一个开源R包，但是使用时要求首先安装Lixoft套件，它通过`lixoftConnectors`包来与Lixoft套件相连接，lixoftConnectors包又需要一个叫做`RJSONIO`的包。

注意，mlxR包和RJSONIO包均可直接通过`install.packages()`命令安装；但是lixoftConnectors包需要从本地来安装：

```
install.packages("RJSONIO")
install.packages("C:/ProgramData/Lixoft/MonolixSuite2019R2/connectors/lixoftConnectors.tar.gz", repos = NULL, type="source") 
install.packages("mlxR")
```

## 6. MATLAB

MATLAB的[SimBiology](https://www.mathworks.com/products/simbiology.html?s_tid=srchtitle)可用于生理动态过程的建模、模拟和分析，包括PK/PD、PBPK、QSP模型等。MATLAB收费，但可免费使用一段时间；如果你的学校有购买，可以使用所在学校的。
