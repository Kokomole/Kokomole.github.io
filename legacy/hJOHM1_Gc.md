<!-- meta {"date":"2020-10-15","slug":"hJOHM1_Gc","title":"母药与代谢物模型","tags":["PK/PD","NONMEM"]} -->

对一篇奥卡西平群体药动学文献[1](#refer-anchor-1)的模型还原，该模型涉及吸收过程的房室转运和母药-代谢物建模。

## 1. 概述

奥卡西平（Oxcarbapezine，OXC）是一种神经性药物，可用于局限性及全身性癫痫发作。奥卡西平口服吸收迅速，在肝脏中快速而广泛地代谢为MHD（主要抗癫痫活性成分），MHD是由R-(-)-MHD和S-(+)-MHD组成的对映异构体。

单次口服奥卡西平600mg后，峰浓度可达18.8mmol/L，峰值时间为5.5h。母药的半衰期为2h，MHD的半衰期为9h，肾功能受损者（肌酐清除率小于每分钟30ml）的半衰期延长至19h。代谢物在体内分布广泛，表观分布容积为0.7～0.8L/kg，蛋白结合率为40%，易透过胎盘和血-脑脊液屏障，乳汁中药物浓度为血药浓度的50%。奥卡西平主要经肾脏排出（94%～97.7%），仅少量（1.9%～4.3%）由消化道排泄。

## 2. 结构模型

母药是一个含有吸收转运室的一级消除二室模型，2种构型的代谢物均是一个一级消除的一室模型。示意图如下：

![](https://kokomole.github.io/post-images/1602778125228.JPG)

### 2.1 母药的吸收转运

OXC的吸收过程使用absorption transit compartments描述，共有3个转运室（$n=3$），吸收室之间转运速率常数为$k_{tr}$，平均转运时间为$MTT$，参数之间的关系为

$$
k_{tr}=\frac{n+1}{MTT} \tag{1}
$$

$n+1$是因为最后一个转运室到中央时的转运速率也认为是$k_{tr}$，即$k_a=k_{tr}$。

### 2.2 母药的分布

OXC使用二室模型描述，房室间转运率为$Q$，中央室、外周室的分布容积分别为$V_c$、$V_p$。

### 2.3 母药向代谢物的转化

OXC的消除一部分是以原型药直接排出体外，另一部分是转化为代谢物MHD，母药的清除率为$CL_{OXC}$，向代谢物转化的比例等于$F_{met}$，故转化为代谢物的部分为

$$
CL_m=CL_{OXC} \times F_{met} \tag{2}
$$

原型药消除的部分为

$$
CL_{other}=CL_{OXC} \times (1-F_{met}) \tag{3}
$$

MHD由R-(-)-MHD和S-(+)-MHD组成，母药向这两种异构体的转化比例不同，向RR-(-)-MHD转化的比例等于

$$
FRS=\frac{AUC_{R-(-)-MHD}}{AUC_{R-(-)-MHD}+AUC_{S-(+)-MHD}} \tag{4}
$$

故清除率中转化为R-(-)-MHD的部分为

$$
CL_{mR}=CL_m \times FRS=CL_{OXC} \times F_{met} \times FRS \tag{5}
$$

转化为S-(+)-MHD的部分为

$$
CL_{mS}=CL_m \times (1-FRS)=CL_{OXC} \times F_{met} \times (1-FRS) \tag{6}
$$

### 2.4 代谢物的PK

R-(-)-MHD和S-(+)-MHD均为一级消除的一室模型，分布容积分别为$V_{RMHD}$、$V_{SMHD}$；清除率分别为$CL_{RMHD}$和$CL_{SMHD}$。本模型对2种异构体使用相同的清除率，即$CL_{MHD}=CL_{RMHD}=CL_{SMHD}$。

## 3. 参数及其变异

### 3.1 PK参数典型值

| 参数 | 值 | 单位 |
| --- | --- | --- |
| $MTT$ | 0.514 | h |
| $CL_{OXC}$ | 84.8 | L/h |
| $Q$ | 55.8 | L/h |
| $V_c$ | 131 | L |
| $V_p$ | 456 | L |
| $F_{met}$ | 0.79 | \- |
| $FRS$ | 0.19 | \- |
| $CL_{MHD}$ | 2.01 | L/h |
| $V_{RMHD}$ | 23.6 | L |
| $V_{SMHD}$ | 31.7 | L |

### 3.2 固定效应

使用移速生长模型纳入体重：

$$
CL_i=CL_p \times (\frac{BW_i}{68})^{0.75} \tag{7}
$$

$$
V_i=V_p \times (\frac{BW_i}{68}) \tag{8}
$$

### 3.3 个体间变异

本模型的个体间变异使用指数模型：

$$
\theta_i=\theta_p \times e^{\eta_i} \tag{9}
$$

模型给出的个体间变异形式是变异系数（CV%），$\eta$与$CV$的关系为

$$
CV\%=\sqrt{\exp({Var(\eta))}-1} \tag{10}
$$

故个体间变异为：

| 参数 | CV% | $Var(\eta)$ |
| --- | --- | --- |
| $MTT$ | 17.1 | 0.02882 |
| $CL_{OXC}$ | 18.1 | 0.03224 |
| $V_c$ | 23.5 | 0.05375 |
| $V_{RMHD}$ | 22.2 | 0.04811 |
| $V_{SMHD}$ | 22.2 | 0.04811 |

### 3.4 残差变异

对OXC、R-(-)-MHD、S-(+)-MHD的残差均使用比例型：

$$
C_{ij,obs}=C_{ij,pred} \times (1+\epsilon_{ij,prop})
$$

比例型残差的值分别为：

|  | $\sigma_{prop}$ | $Var(\epsilon)$ |
| --- | --- | --- |
| OXC | 0.097 | 0.009409 |
| R-(-)-MHD | 0.017 | 0.000289 |
| S-(+)-MHD | 0.017 | 0.000289 |

## 4. 最终模型

![](https://kokomole.github.io/post-images/1602779267300.JPG)

## 5. NM控制文件

```
$PROB RODRIGUES CHILD 2017

$INPUT ID TIME DV AMT II ADDL EVID MDV WT CMT
$DATA 12060000060006001.csv

$SUBROUTINES ADVAN13 TOL=6

$MODEL
COMP(DEPOT,DEFDOS)	; CMT 1
COMP(TRANSI1)		; CMT 2
COMP(TRANSI2)		; CMT 3
COMP(TRANSI3)		; CMT 4
COMP(CENT,DEFOBS)	; CMT 5
COMP(PERI)		; CMT 6
COMP(MHDR)		; CMT 7
COMP(MHDS)		; CMT 8

$PK
; OXC
MTT = THETA(1)*EXP(ETA(1))
CLCOX_TOTAL = THETA(2)*(WT/68)**0.75*EXP(ETA(2))
Q = THETA(3)
VCOXC = THETA(4)*(WT/68)*EXP(ETA(3))
VPOXC = THETA(5)*(WT/68)
FMET = THETA(6)
; MHD
CLMHD = THETA(7)*(WT/68)**0.75
FRS = THETA(8)
VMHD_R = THETA(9)*(WT/68)*EXP(ETA(4))
VMHD_S = THETA(10)*(WT/68)*EXP(ETA(5))

$DES
; OXC
KTR = 4/MTT
K5 = CLCOX_TOTAL/VCOXC
K56 = Q/VCOXC
K65 = Q/VPOXC
; MHD
CLM = CLCOX_TOTAL*FMET
K57 = CLM*FRS/VCOXC
K58 = CLM*(1 - FRS)/VCOXC
K70 = CLMHD/VMHD_R
K80 = CLMHD/VMHD_S

DADT(1) = - KTR*A(1)
DADT(2) = KTR*A(1) - KTR*A(2)
DADT(3) = KTR*A(2) - KTR*A(3)
DADT(4) = KTR*A(3) - KTR*A(4)
DADT(5) = KTR*A(4) - K5*A(5) - K56*A(5) + K65*A(6) 
DADT(6) = K56*A(5) - K65*A(6)
DADT(7) = K57*A(5) - K70*A(7)                          
DADT(8) = K58*A(5) - K80*A(8)                  

$ERROR
C_OXC = A(5)/VCOXC
C_MHD_R = A(7)/VMHD_R
C_MHD_S = A(8)/VMHD_S

IPRED=C_OXC						   ; OXC
IF (CMT.EQ.7) IPRED=C_MHD_R   		 ; R_MHD
IF (CMT.EQ.8) IPRED=C_MHD_S   		 ; S_MHD

Y = IPRED*(1+EPS(1))   			 ; OXC
IF (CMT.EQ.7) Y = IPRED*(1+EPS(2))   ; R_MHD
IF (CMT.EQ.8) Y = IPRED*(1+EPS(2))   ; S_MHD

IRES=DV-IPRED
DEL = 0
IF (IPRED.EQ.0) DEL=1
IWRES = (1-DEL) * IRES / (IPRED + DEL)
 
$THETA  
; OXC
0.514  ; 1.MTT
84.8   ; 2.CL_COX_total
55.8   ; 3.Q
131    ; 4.Vc_OXC
456    ; 5.Vp_OXC
0.79   ; 6.Fmet
; MHD
2.01   ; 7.CL_MHD
0.19   ; 8.FRS
23.6   ; 9.Vs_MHD
31.7   ; 10.Vr_MHD

$OMEGA 
0.02882  ; 1.BSV_MTT
0.03224  ; 2.BSV_CL_OXC
0.05375  ; 3.BSV_Vc_OXC
0.04811  ; 4.BSV_Vr_MHD
0.04811  ; 5.BSV_Vs_MHD

$SIGMA
0.009409   ;1.OXC_EPS
0.000289   ;2.MHD_EPS

$SIMULATION (12345678) ONLYSIM SUBPROBLEM=100
$TABLE ID TIME DV CMT NOAPPEND NOPRINT NOHEADER FILE=s1.fit
```

## 6. 数据文件

各列依次为：ID、TIME、DV、AMT、II、ADDL、EVID、MDV、WT、CMT。共模拟到第12小时，房室5、7、8分别为OXC、R-(-)-MHD、S-(+)-MHD的观测。

![](https://kokomole.github.io/post-images/1602780940310.JPG)

## 7. 模拟结果

模拟100次。自上而下分别是R-(-)-MHD、OXC、S-(+)-MHD的浓度，左图为文献中实测浓度，右图为模拟结果。

![](https://kokomole.github.io/post-images/1602780883750.JPG)

## 8. 参考文献

\[1\] Antunes NJ, van Dijkman SC, Lanchote VL, Wichert-Ana L, Coelho EB, Alexandre Junior V, Takayanagui OM, Tozatto E, van Hasselt JGC, Della Pasqua O. Population pharmacokinetics of oxcarbazepine and its metabolite 10-hydroxycarbazepine in healthy subjects. Eur J Pharm Sci. 2017 Nov 15;109S:S116-S123.(https://pubmed.ncbi.nlm.nih.gov/28528287/)
